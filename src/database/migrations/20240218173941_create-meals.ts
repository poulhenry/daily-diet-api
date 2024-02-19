import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', table => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.text('description')
        table.boolean('is_on_diet').defaultTo(false)
        table.uuid('user_id').index()
        table.timestamp('created_at').defaultTo(knex.fn.now())
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}
