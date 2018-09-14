/*!
* Module dependencies.
* Immportant: Schema support was experimental. Ir is not 
* included infinal 0.1 implementation of Willa. It is not 
* clear if schema will be incorporated in willa in future.
*/

// const Ajv  = require('ajv'),
//       _ = require('lodash');



// class Schema  {
//   constructor(id, schema, propCase = 'camel') {
//     this.id = id;
//     this.schema = {};
//     this.data = {};
//     this._setCase(propCase);
//     this._setSchema(schema);
//   }

//   _setCase(propCase) {
//     switch (propCase) {
//       case 'snake':
//         this.caseConverter = _.snakeCase;
//         break
//       case 'camel':
//       default:
//         this.caseConverter = _.camelCase;
//     }
//   }

//   _setSchema(schema) {
//     if(!_.isEmpty(schema))
//       this.schema = schema;
//   }

//   async map(data) {
//     if(!_.isEmpty(data) && _.isPlainObject(data)) {
//       try {
//         this.data = await this._objMapper(data, this.schema);
//         return this.data;
//       } catch (err) {
//         throw err;
//       }
//     }
//     let err = null;
//     if(_.isPlainObject(data)) {
//       err = Error('Data must be a Plain JavaScript Object');
//     } else {
//       err = Error('Cannot map empty data');
//     }
//     throw err; 
//   }

//   async _objMapper(data, schema) {
//     let returnObj = {},
//     dataProps = Object.keys(data);

//     let mapped = dataProps.map(async (prop) => {
//       let objProp =  this.caseConverter(prop);
//       try {
//         if(_.has(schema, objProp)) {
//           if(_.isPlainObject(data[prop])) {
//             returnObj[objProp] = await this._objMapper(data[prop], schema[objProp]);
//           } else if(_.isArray(data[prop])) {
//             returnObj[objProp] = await this._arrayMapper(data[prop], schema[objProp]);
//           } else {
//             returnObj[objProp] = data[prop];
//           }
//           return;
//         } else {
//           throw Error(`Cannot map property ${prop}: ${data[prop]}`);
//         }
//       } catch (err) {
//         throw err;
//       }
//     });
//     return Promise.all(mapped)
//       .then(() => returnObj) 
//       .catch ((err) => { throw err});
//   }

//   async _arrayMapper(data, schema) {

//   }

//   validate() {

//   }
// }

/* Example Code */
// let s =  new Schema('test', {
//   name: {type: 'sting'},
//   job: {type: 'number'},
//   office: {
//     location: {type: 'string'}, 
//     country: {type: 'string'},
//     coOrd: {
//       latFlt: 'number',
//       longFlt: 'number'
//     }
//   }
// });

// (async ()=> {
//   try {
//   let myMap = await s.map({ name: 'Sourav', job: 'Developer', office: { 
//       location: 'Bangalore', country: 'India', co_ord: { lat_flt: 12.9, long_flt: 77.5 }}});
//   } catch(err) {
//     console.log(err);
//   } 
// })()


