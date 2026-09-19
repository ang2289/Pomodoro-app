var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
// 檢查是否已生成 SSL 憑證
var httpsEnabled = fs.existsSync(path.resolve(__dirname, 'localhost.key')) &&
    fs.existsSync(path.resolve(__dirname, 'localhost.crt'));
// https://vitejs.dev/config/
// 注意：必須用 loadEnv 讀取 .env / .env.local 的 VITE_VERCEL_URL，否則 proxy 會拿不到你在檔案裡設的本機 API 位址
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var serverEnv = loadEnv(mode, process.cwd(), '');
    Object.assign(process.env, serverEnv);
    var env = loadEnv(mode, process.cwd(), 'VITE_');
    var apiProxyTarget = ((_b = env.VITE_VERCEL_URL) === null || _b === void 0 ? void 0 : _b.trim()) || 'https://pomodoro-app-eight-rouge.vercel.app';
    var apiIsHttps = apiProxyTarget.startsWith('https://');
    return {
        plugins: [
            react(),
            {
                name: 'local-group-buy-api',
                apply: 'serve',
                configureServer: function (server) {
                    var _this = this;
                    server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                        var requestUrl, chunks, chunk, e_1_1, rawBody, apiModule, error_1;
                        var _a, req_1, req_1_1;
                        var _b, e_1, _c, _d;
                        var _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    if (!((_e = req.url) === null || _e === void 0 ? void 0 : _e.startsWith('/api/group-buy')))
                                        return [2 /*return*/, next()];
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, 17, , 18]);
                                    requestUrl = new URL(req.url, 'http://localhost');
                                    req.query = Object.fromEntries(requestUrl.searchParams.entries());
                                    if (!(!req.body && !['GET', 'HEAD'].includes(String(req.method || '').toUpperCase()))) return [3 /*break*/, 14];
                                    chunks = [];
                                    _f.label = 2;
                                case 2:
                                    _f.trys.push([2, 7, 8, 13]);
                                    _a = true, req_1 = __asyncValues(req);
                                    _f.label = 3;
                                case 3: return [4 /*yield*/, req_1.next()];
                                case 4:
                                    if (!(req_1_1 = _f.sent(), _b = req_1_1.done, !_b)) return [3 /*break*/, 6];
                                    _d = req_1_1.value;
                                    _a = false;
                                    chunk = _d;
                                    chunks.push(Buffer.from(chunk));
                                    _f.label = 5;
                                case 5:
                                    _a = true;
                                    return [3 /*break*/, 3];
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    e_1_1 = _f.sent();
                                    e_1 = { error: e_1_1 };
                                    return [3 /*break*/, 13];
                                case 8:
                                    _f.trys.push([8, , 11, 12]);
                                    if (!(!_a && !_b && (_c = req_1.return))) return [3 /*break*/, 10];
                                    return [4 /*yield*/, _c.call(req_1)];
                                case 9:
                                    _f.sent();
                                    _f.label = 10;
                                case 10: return [3 /*break*/, 12];
                                case 11:
                                    if (e_1) throw e_1.error;
                                    return [7 /*endfinally*/];
                                case 12: return [7 /*endfinally*/];
                                case 13:
                                    rawBody = Buffer.concat(chunks).toString('utf8');
                                    req.body = rawBody || undefined;
                                    _f.label = 14;
                                case 14:
                                    res.status = function (statusCode) {
                                        res.statusCode = statusCode;
                                        return res;
                                    };
                                    res.json = function (payload) {
                                        res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                        res.end(JSON.stringify(payload));
                                        return res;
                                    };
                                    return [4 /*yield*/, server.ssrLoadModule('/api/group-buy.ts')];
                                case 15:
                                    apiModule = _f.sent();
                                    return [4 /*yield*/, apiModule.default(req, res)];
                                case 16:
                                    _f.sent();
                                    return [3 /*break*/, 18];
                                case 17:
                                    error_1 = _f.sent();
                                    console.error('[local-group-buy-api] request failed', error_1);
                                    if (!res.headersSent) {
                                        res.statusCode = 500;
                                        res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                    }
                                    if (!res.writableEnded)
                                        res.end(JSON.stringify({ error: 'LOCAL_GROUP_BUY_API_FAILED' }));
                                    return [3 /*break*/, 18];
                                case 18: return [2 /*return*/];
                            }
                        });
                    }); });
                },
            },
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: __assign(__assign({ host: '0.0.0.0', port: 3005 }, (httpsEnabled ? {
            https: {
                key: fs.readFileSync(path.resolve(__dirname, 'localhost.key')),
                cert: fs.readFileSync(path.resolve(__dirname, 'localhost.crt')),
            },
        } : {})), { hmr: {
                overlay: false,
                host: 'localhost',
                port: 3005,
                protocol: 'ws'
            }, watch: {
                ignored: [
                    '**/playwright_shopee_profile/**',
                    '**/.tmp_shopee_batch_mp4/**',
                    '**/output/**',
                    '**/out_mp4/**',
                    '**/debug_pick/**',
                    '**/public/goods-share/**',
                    '**/temp_input.csv',
                    '**/tmp_audio/**',
                    '**/tmp_images/**',
                ],
            }, 
            // 本機 `npm run dev`（port 見 package.json，預設 3005）時，/api 會轉發到：
            // - .env.local 的 VITE_VERCEL_URL（例如 vercel dev 本機：http://127.0.0.1:3000）
            // - 未設定則走線上 Vercel API
            proxy: {
                '/api': {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    secure: apiIsHttps,
                    rewrite: function (p) { return p; },
                }
            } })
    };
});
