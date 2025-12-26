/**
 * =====================================
 * TURKEY DATA - INDEX
 * =====================================
 *
 * Turkey-specific location data exports.
 */

export {
  TURKEY_CITIES,
  getCitiesByRegion,
  getCityByCode,
  getCityByName,
  searchCities,
  type City,
} from './cities';

export {
  TURKEY_DISTRICTS,
  getDistrictsByCity,
  hasDistrictsData,
} from './districts';
