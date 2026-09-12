import { findGroupByCode } from './groupService';
// 產生 UUID
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
// 儲存群組成員到 localStorage
export const saveGroupMember = (member) => {
    const members = getGroupMembers();
    members.push(member);
    localStorage.setItem('pomodoro-group-members', JSON.stringify(members));
};
// 從 localStorage 取得所有群組成員
export const getGroupMembers = () => {
    const members = localStorage.getItem('pomodoro-group-members');
    return members ? JSON.parse(members) : [];
};
// 根據群組 ID 取得成員列表
export const getGroupMembersByGroupId = (groupId) => {
    const members = getGroupMembers();
    return members.filter(member => member.groupId === groupId);
};
// 根據使用者 ID 取得加入的群組
export const getGroupsByUserId = (userId) => {
    const members = getGroupMembers();
    const userGroups = members
        .filter(member => member.userId === userId)
        .map(member => member.groupId);
    // 從群組資料中取得完整群組資訊
    const allGroups = JSON.parse(localStorage.getItem('pomodoro-groups') || '[]');
    return allGroups.filter((group) => userGroups.includes(group.id));
};
// 檢查使用者是否已加入群組
export const isUserInGroup = (userId, groupId) => {
    const members = getGroupMembers();
    return members.some(member => member.userId === userId && member.groupId === groupId);
};
// 加入群組
export const joinGroup = (data) => {
    try {
        // 尋找群組
        const group = findGroupByCode(data.groupCode);
        if (!group) {
            return { success: false, message: '找不到該群組代碼' };
        }
        // 檢查是否已加入
        if (isUserInGroup(data.userId, group.id)) {
            return { success: false, message: '您已經加入此群組了' };
        }
        // 建立成員資料
        const member = {
            id: generateUUID(),
            groupId: group.id,
            userId: data.userId,
            userName: data.userName,
            joinedAt: new Date().toISOString(),
            role: 'member'
        };
        // 儲存成員資料
        saveGroupMember(member);
        return { success: true, message: '成功加入群組！', group };
    }
    catch (error) {
        console.error('加入群組失敗:', error);
        return { success: false, message: '加入群組失敗，請重試' };
    }
};
// 離開群組
export const leaveGroup = (userId, groupId) => {
    try {
        const members = getGroupMembers();
        const updatedMembers = members.filter(member => !(member.userId === userId && member.groupId === groupId));
        localStorage.setItem('pomodoro-group-members', JSON.stringify(updatedMembers));
        return true;
    }
    catch (error) {
        console.error('離開群組失敗:', error);
        return false;
    }
};
