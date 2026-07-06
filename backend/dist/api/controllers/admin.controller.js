"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const di_container_1 = require("../di-container");
const get_configs_1 = require("../../application/use-cases/admin/get-configs");
const update_config_1 = require("../../application/use-cases/admin/update-config");
const get_templates_1 = require("../../application/use-cases/admin/get-templates");
const update_template_1 = require("../../application/use-cases/admin/update-template");
const broadcast_notification_1 = require("../../application/use-cases/admin/broadcast-notification");
const get_ledger_1 = require("../../application/use-cases/admin/get-ledger");
const payout_host_1 = require("../../application/use-cases/admin/payout-host");
const admin_login_1 = require("../../application/use-cases/admin/admin-login");
const approve_event_1 = require("../../application/use-cases/events/approve-event");
const socket_1 = require("../../config/socket");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
class AdminController {
    static async adminLogin(req, res, next) {
        try {
            const { identifier, email, username, password } = req.body;
            const adminIdentifier = identifier || email || username;
            const result = await di_container_1.mediator.send(new admin_login_1.AdminLoginCommand(adminIdentifier, password, req.ip));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getIntegrationConfigs(req, res, next) {
        try {
            const configs = await di_container_1.mediator.send(new get_configs_1.GetConfigsQuery());
            return api_response_1.ApiResponse.success(res, configs);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateIntegrationConfig(req, res, next) {
        try {
            const { serviceName } = req.params;
            const { environment, credentials, isActive } = req.body;
            const updated = await di_container_1.mediator.send(new update_config_1.UpdateConfigCommand(serviceName, environment, credentials, isActive, req.user.id));
            return api_response_1.ApiResponse.success(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMessageTemplates(req, res, next) {
        try {
            const templates = await di_container_1.mediator.send(new get_templates_1.GetTemplatesQuery());
            return api_response_1.ApiResponse.success(res, templates);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMessageTemplate(req, res, next) {
        try {
            const { templateId } = req.params;
            const { bodyContent, variables, isActive, subject } = req.body;
            const updated = await di_container_1.mediator.send(new update_template_1.UpdateTemplateCommand(templateId, {
                bodyContent,
                variables,
                isActive,
                subject,
            }));
            return api_response_1.ApiResponse.success(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlatformSettings(req, res, next) {
        try {
            const settings = await di_container_1.configRepo.findAllPlatformSettings();
            return api_response_1.ApiResponse.success(res, settings);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePlatformSetting(req, res, next) {
        try {
            const { key, value } = req.body;
            if (!key || value === undefined) {
                throw new errors_1.BadRequestError('Missing key and value parameter');
            }
            const setting = await di_container_1.configRepo.upsertPlatformSetting(key, value);
            await di_container_1.cacheService.del(`configs:platform:${key}`);
            return api_response_1.ApiResponse.success(res, setting);
        }
        catch (error) {
            next(error);
        }
    }
    static async getNotificationLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page || '1', 10);
            const limit = parseInt(req.query.limit || '20', 10);
            const status = req.query.status;
            const skip = (page - 1) * limit;
            const filters = status ? { status } : {};
            const [logs, total] = await Promise.all([
                di_container_1.notificationRepo.findMany(filters, skip, limit),
                di_container_1.notificationRepo.count(filters),
            ]);
            return api_response_1.ApiResponse.success(res, {
                logs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async broadcastNotification(req, res, next) {
        try {
            const { channel, cohort, targetUserId, triggerEvent, subject, bodyContent } = req.body;
            const result = await di_container_1.mediator.send(new broadcast_notification_1.BroadcastNotificationCommand(channel, cohort, targetUserId, triggerEvent || 'BROADCAST', subject, bodyContent));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEventQueue(req, res, next) {
        try {
            const queue = await di_container_1.eventRepo.findPendingEvents();
            return api_response_1.ApiResponse.success(res, queue);
        }
        catch (error) {
            next(error);
        }
    }
    static async approveEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const { commissionType, platformValue } = req.body;
            const result = (await di_container_1.mediator.send(new approve_event_1.ApproveEventCommand(eventId, commissionType, Number(platformValue))));
            try {
                (0, socket_1.getIO)().emit('event_approved', {
                    id: result.event.id,
                    title: result.event.title,
                    startTime: result.event.startTime,
                });
            }
            catch (e) {
                di_container_1.logger.warn('[Socket] Failed to broadcast event approval:', e);
            }
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getFinanceLedger(req, res, next) {
        try {
            const ledger = await di_container_1.mediator.send(new get_ledger_1.GetLedgerQuery());
            return api_response_1.ApiResponse.success(res, ledger);
        }
        catch (error) {
            next(error);
        }
    }
    static async payoutHost(req, res, next) {
        try {
            const { hostId } = req.params;
            const result = await di_container_1.mediator.send(new payout_host_1.PayoutHostCommand(hostId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
