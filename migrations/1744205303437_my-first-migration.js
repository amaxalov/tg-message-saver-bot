exports.up = (pgm) => {
  pgm.createTable('messages', {
    id: { type: 'serial', primaryKey: true },
    message_id: { type: 'integer', notNull: true },
    chat_id: { type: 'bigint', notNull: true },
    text: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('messages');
};