// Google Calendar API 設定
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
// Google Calendar 服務類別
export class GoogleCalendarService {
    constructor() {
        Object.defineProperty(this, "gapi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isSignedIn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "authInstance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.loadGapi();
    }
    // 載入 Google API
    async loadGapi() {
        if (typeof window !== 'undefined' && window.gapi) {
            this.gapi = window.gapi;
            await this.initializeGapi();
        }
        else {
            // 動態載入 Google API
            await this.loadGoogleAPI();
        }
    }
    // 動態載入 Google API 腳本
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                reject(new Error('Window is not available'));
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('client:auth2', () => {
                    this.gapi = window.gapi;
                    this.initializeGapi().then(resolve).catch(reject);
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    // 初始化 Google API
    async initializeGapi() {
        try {
            // 檢查必要的環境變數，若不存在則跳過初始化
            if (!API_KEY || !CLIENT_ID) {
                console.warn('Google Calendar API 環境變數未設定，跳過初始化');
                console.warn('請在 .env 檔案中設定 VITE_GOOGLE_API_KEY 和 VITE_GOOGLE_CALENDAR_CLIENT_ID');
                this.isSignedIn = false;
                return;
            }
            await this.gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: [DISCOVERY_DOC],
                scope: SCOPES
            });
            // 加上 null 檢查邏輯
            if (this.gapi.auth2 && this.gapi.auth2.getAuthInstance()) {
                this.authInstance = this.gapi.auth2.getAuthInstance();
                this.isSignedIn = this.authInstance.isSignedIn.get();
            }
            else {
                console.warn('Google Auth2 not available');
                this.isSignedIn = false;
            }
        }
        catch (error) {
            console.error('Failed to initialize Google API:', error);
            this.isSignedIn = false;
        }
    }
    // 檢查是否已登入
    isAuthenticated() {
        // 檢查環境變數是否存在
        if (!API_KEY || !CLIENT_ID) {
            return false;
        }
        // 加上 null 檢查邏輯
        if (this.gapi && this.gapi.auth2 && this.gapi.auth2.getAuthInstance()) {
            try {
                return this.gapi.auth2.getAuthInstance().isSignedIn.get();
            }
            catch (error) {
                console.warn('Failed to check authentication status:', error);
                return false;
            }
        }
        return this.isSignedIn;
    }
    // Google OAuth 登入
    async signIn() {
        try {
            // 檢查環境變數是否存在
            if (!API_KEY || !CLIENT_ID) {
                console.warn('Google Calendar API 環境變數未設定，無法登入');
                return false;
            }
            if (!this.authInstance) {
                await this.initializeGapi();
            }
            // 加上 null 檢查邏輯
            if (!this.authInstance) {
                throw new Error('Google Auth instance not available');
            }
            const authResult = await this.authInstance.signIn();
            this.isSignedIn = authResult.isSignedIn();
            return this.isSignedIn;
        }
        catch (error) {
            console.error('Google sign-in failed:', error);
            this.isSignedIn = false;
            return false;
        }
    }
    // Google 登出
    async signOut() {
        try {
            if (this.authInstance) {
                await this.authInstance.signOut();
                this.isSignedIn = false;
            }
        }
        catch (error) {
            console.error('Google sign-out failed:', error);
        }
    }
    // 獲取使用者資訊
    async getUserInfo() {
        try {
            // 檢查環境變數是否存在
            if (!API_KEY || !CLIENT_ID) {
                return null;
            }
            // 加上 null 檢查邏輯
            if (!this.isSignedIn || !this.authInstance || !this.gapi || !this.gapi.auth2) {
                return null;
            }
            const currentUser = this.authInstance.currentUser.get();
            if (!currentUser) {
                return null;
            }
            const profile = currentUser.getBasicProfile();
            if (!profile) {
                return null;
            }
            return {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl()
            };
        }
        catch (error) {
            console.error('Failed to get user info:', error);
            return null;
        }
    }
    // 創建日曆事件
    async createEvent(eventData) {
        try {
            // 檢查環境變數是否存在
            if (!API_KEY || !CLIENT_ID) {
                throw new Error('Google Calendar API 環境變數未設定');
            }
            // 加上 null 檢查邏輯
            if (!this.isSignedIn || !this.gapi || !this.gapi.client) {
                throw new Error('User not authenticated or Google API not initialized');
            }
            const event = {
                summary: eventData.title,
                description: eventData.description || '',
                start: eventData.isAllDay ? {
                    date: eventData.startDateTime.split('T')[0] // 整天事件只使用日期
                } : {
                    dateTime: eventData.startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: eventData.isAllDay ? {
                    date: eventData.endDateTime ? eventData.endDateTime.split('T')[0] : eventData.startDateTime.split('T')[0]
                } : {
                    dateTime: eventData.endDateTime || eventData.startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            const response = await this.gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event
            });
            return response.result;
        }
        catch (error) {
            console.error('Failed to create calendar event:', error);
            throw error;
        }
    }
    // 更新日曆事件
    async updateEvent(eventId, eventData) {
        try {
            // 加上 null 檢查邏輯
            if (!this.isSignedIn || !this.gapi || !this.gapi.client) {
                throw new Error('User not authenticated or Google API not initialized');
            }
            const event = {
                summary: eventData.title,
                description: eventData.description || '',
                start: eventData.isAllDay ? {
                    date: eventData.startDateTime.split('T')[0]
                } : {
                    dateTime: eventData.startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: eventData.isAllDay ? {
                    date: eventData.endDateTime ? eventData.endDateTime.split('T')[0] : eventData.startDateTime.split('T')[0]
                } : {
                    dateTime: eventData.endDateTime || eventData.startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            const response = await this.gapi.client.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event
            });
            return response.result;
        }
        catch (error) {
            console.error('Failed to update calendar event:', error);
            throw error;
        }
    }
    // 刪除日曆事件
    async deleteEvent(eventId) {
        try {
            // 加上 null 檢查邏輯
            if (!this.isSignedIn || !this.gapi || !this.gapi.client) {
                throw new Error('User not authenticated or Google API not initialized');
            }
            await this.gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
        }
        catch (error) {
            console.error('Failed to delete calendar event:', error);
            throw error;
        }
    }
}
// 創建全域實例
export const googleCalendarService = new GoogleCalendarService();
