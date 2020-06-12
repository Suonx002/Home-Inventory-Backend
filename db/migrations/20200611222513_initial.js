// up is running the migration || down is drop everything and roll back
const Knex = require('knex');
const tableNames = require('../../src/constants/tableNames');

/**
 *
 * @param {Knex} knex
 */

const addDefaultColumns = (table) => {
  table.timestamps(false, true);
  table.datetime('deleted_at');
};

const createNameTable = (knex, table_name) => {
  return knex.schema.createTable(table_name, (table) => {
    table.increments().notNullable();
    table.string('name').notNullable().unique();
  });
};

exports.up = async (knex) => {
  // create users table
  await knex.schema.createTable(tableNames.users, (table) => {
    table.increments().notNullable();
    table.string('email', 254).notNullable().unique();
    table.string('name').notNullable();
    table.string('password', 127).notNullable();
    table.datetime('last_login');
    addDefaultColumns(table);
  });
  // create item_type table
  await createNameTable(knex, tableNames.item_type);

  // create state table
  await createNameTable(knex, tableNames.state);

  // create country table
  await createNameTable(knex, tableNames.country);
};

exports.down = async (knex) => {
  await knex.schema.dropTable(tableNames.users);
};
