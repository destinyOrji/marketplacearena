/**
 * Notification Helper
 * Ensures notifications are sent to the correct user based on their role
 */

const Notification = require('../models/Notification');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Professional = require('../models/Professional');
const GymPhysio = require('../models/GymPhysio');
const Hospital = require('../models/Hospital');
const Ambulance = require('../models/Ambulance');

/**
 * Get the User ID for a given entity
 * @param {String} entityType - Type of entity (admin, client, professional, gym-physio, hospital, ambulance)
 * @param {String} entityId - ID of the entity
 * @returns {Promise<String|null>} User ID or null
 */
async function getUserIdFromEntity(entityType, entityId) {
    try {
        let entity;
        
        switch (entityType) {
            case 'admin':
                entity = await Admin.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'client':
            case 'patient':
                entity = await Client.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'professional':
                entity = await Professional.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'gym-physio':
            case 'gymPhysio':
                entity = await GymPhysio.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'hospital':
                entity = await Hospital.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'ambulance':
                entity = await Ambulance.findById(entityId).populate('user');
                return entity?.user?._id || entity?.user;
                
            case 'user':
                // Already a user ID
                return entityId;
                
            default:
                console.error(`Unknown entity type: ${entityType}`);
                return null;
        }
    } catch (error) {
        console.error(`Error getting user ID for ${entityType}:`, error);
        return null;
    }
}

/**
 * Send notification to a specific user
 * @param {Object} params - Notification parameters
 * @param {String} params.recipientType - Type of recipient (admin, client, professional, gym-physio, hospital, ambulance, user)
 * @param {String} params.recipientId - ID of the recipient entity
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.type - Notification type (appointment, payment, system, etc.)
 * @param {Object} params.data - Additional data
 * @returns {Promise<Object|null>} Created notification or null
 */
async function sendNotification({ recipientType, recipientId, title, message, type = 'general', data = {} }) {
    try {
        // Get the actual user ID
        const userId = await getUserIdFromEntity(recipientType, recipientId);
        
        if (!userId) {
            console.error(`Could not find user ID for ${recipientType} with ID ${recipientId}`);
            return null;
        }

        // Create notification
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            data
        });

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
}

/**
 * Send notification to multiple users
 * @param {Array} recipients - Array of {recipientType, recipientId}
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 * @returns {Promise<Array>} Array of created notifications
 */
async function sendBulkNotifications(recipients, title, message, type = 'general', data = {}) {
    const notifications = [];
    
    for (const recipient of recipients) {
        const notification = await sendNotification({
            recipientType: recipient.recipientType,
            recipientId: recipient.recipientId,
            title,
            message,
            type,
            data
        });
        
        if (notification) {
            notifications.push(notification);
        }
    }
    
    return notifications;
}

/**
 * Send notification to all admins
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 * @returns {Promise<Array>} Array of created notifications
 */
async function notifyAllAdmins(title, message, type = 'system', data = {}) {
    try {
        const admins = await Admin.find({}).populate('user');
        const notifications = [];
        
        for (const admin of admins) {
            if (admin.user) {
                const notification = await Notification.create({
                    user: admin.user._id,
                    title,
                    message,
                    type,
                    data
                });
                notifications.push(notification);
            }
        }
        
        return notifications;
    } catch (error) {
        console.error('Error notifying admins:', error);
        return [];
    }
}

module.exports = {
    getUserIdFromEntity,
    sendNotification,
    sendBulkNotifications,
    notifyAllAdmins
};
