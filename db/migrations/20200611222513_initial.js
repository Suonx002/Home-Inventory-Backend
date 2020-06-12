// up is running the migration || down is drop everything and roll back
const Knex = require('knex');
const tableNames = require('../../src/constants/tableNames');

const addDefaultColumns = (table) => {
  table.timestamps(false, true);
  table.datetime('deleted_at');
};

const createNameTable = (knex, table_name) => {
  return knex.schema.createTable(table_name, (table) => {
    table.increments().notNullable();
    table.string('name').notNullable().unique();
    addDefaultColumns(table);
  });
};

const tableReferences = (table, columnName, foreignTableName) => {
  table.integer(columnName).unsigned();
  table.foreign(columnName).references('id').inTable(foreignTableName);
};

const urlColumn = (table, columnName) => {
  table.string(columnName, 2000);
};

const emailColumn = (table, columnName) => {
  return table.string(columnName, 254);
};

/**
 *
 * @param {Knex} knex
 */

exports.up = async (knex) => {
  // using promise.all since these tables don't depends on each other
  await Promise.all([
    // create users table
    await knex.schema.createTable(tableNames.user, (table) => {
      table.increments().notNullable();
      emailColumn(table, 'email').notNullable().unique();
      table.string('name').notNullable();
      table.string('password', 127).notNullable();
      table.datetime('last_login');
      addDefaultColumns(table);
    }),
    // create inventory_location table
    await knex.schema.createTable(tableNames.inventory_location, (table) => {
      table.increments().notNullable();
      table.string('name').notNullable().unique();
      table.string('description', 1000);
      urlColumn(table, 'image_url');
      urlColumn(table, 'website_url');
      addDefaultColumns(table);
    }),
    // create item_type table
    await createNameTable(knex, tableNames.item_type),
    // create state table
    await createNameTable(knex, tableNames.state),
    // create country table
    await createNameTable(knex, tableNames.country),
    // create shape table
    await createNameTable(knex, tableNames.shape),
  ]);

  // create address table
  await knex.schema.createTable(tableNames.address, (table) => {
    table.increments().notNullable();
    table.string('street_address_1', 50).notNullable();
    table.string('street_address_2', 50);
    table.string('city', 50).notNullable();
    table.string('zipcode', 15).notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    tableReferences(table, 'state_id', 'state');
    tableReferences(table, 'country_id', 'country');
    addDefaultColumns(table);
  });

  // create company table
  await knex.schema.createTable(tableNames.company, (table) => {
    table.increments().notNullable();
    table.string('name').notNullable();
    table.string('description', 1000);
    urlColumn(table, 'logo_url');
    emailColumn(table, 'email');
    tableReferences(table, 'address_id', 'address');
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  await Promise.all(
    [
      tableNames.company,
      tableNames.address,
      tableNames.user,
      tableNames.item_type,
      tableNames.country,
      tableNames.state,
      tableNames.shape,
      tableNames.inventory_location,
    ].map((tableName) => knex.schema.dropTable(tableName))
  );
};
