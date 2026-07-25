import BaseRepository from './BaseRepository.js';

/**
 * AuditRepository managing audit_logs entity queries.
 */
class AuditRepository extends BaseRepository {
  constructor() {
    super('audit_logs');
  }

  /**
   * Log an audit trail entry.
   * @param {string|null} userId - Actor User ID
   * @param {string} action - Action description (e.g. 'UPDATE_DONATION')
   * @param {string} tableName - Target table affected
   * @param {string} recordId - Affected record ID
   * @param {object|null} [oldValues=null] - Payload pre-state
   * @param {object|null} [newValues=null] - Payload post-state
   * @param {string|null} [ipAddress=null] - Actor IP address
   * @param {string|null} [userAgent=null] - Actor client user agent string
   * @returns {Promise<object>}
   */
  async logAction(
    userId,
    action,
    tableName,
    recordId,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  ) {
    this._checkModel();
    return this.create({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  /**
   * Fetch active logs for a particular record.
   */
  async findByRecord(tableName, recordId) {
    this._checkModel();
    return this.model.findMany({
      where: {
        table_name: tableName,
        record_id: recordId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}

export default new AuditRepository();
