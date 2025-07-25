import Knex from 'knex';
import knexConfig from '../knexfile';

const environment = process.env.NODE_ENV || 'development'; 
const knex = Knex(knexConfig[environment]); 

knex.raw('select 1+1 as result')
  .then(() => console.log('Database connection established'))
  .catch((err) => {
    console.error('Database connection failed', err);
    process.exit(1); 
  });

export default knex;