import { Vehicle } from '../types/vehicles';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-car-01',
    name: 'Sedan Passenger Vehicle',
    vehicleClass: 'CAR',
    massKg: 1500,
    massTonnes: 1.5,
    staticForceKn: 14.7, // 1500 * 9.81 / 1000
    axleCount: 2,
    axleSpacingM: [2.8],
    lane: 1, // Eastbound
    positionX: -22,
    speedMps: 18.0, // 65 km/h
    lengthM: 4.6,
    widthM: 1.8,
    heightM: 1.4,
    colorHex: '#38bdf8',
  },
  {
    id: 'veh-bus-01',
    name: 'City Transit Bus',
    vehicleClass: 'BUS',
    massKg: 14000,
    massTonnes: 14.0,
    staticForceKn: 137.3, // 14000 * 9.81 / 1000
    axleCount: 2,
    axleSpacingM: [6.0],
    lane: -1, // Westbound
    positionX: 16,
    speedMps: 14.0, // 50 km/h
    lengthM: 11.5,
    widthM: 2.5,
    heightM: 3.2,
    colorHex: '#10b981',
  },
  {
    id: 'veh-truck-01',
    name: '3-Axle Commercial Freight Truck',
    vehicleClass: 'TRUCK',
    massKg: 28000,
    massTonnes: 28.0,
    staticForceKn: 274.7, // 28000 * 9.81 / 1000
    axleCount: 3,
    axleSpacingM: [4.2, 1.35],
    lane: 1, // Eastbound
    positionX: -6,
    speedMps: 12.5, // 45 km/h
    lengthM: 9.8,
    widthM: 2.5,
    heightM: 3.6,
    colorHex: '#f59e0b',
  },
  {
    id: 'veh-heavy-01',
    name: '5-Axle Heavy Semi-Trailer Truck',
    vehicleClass: 'HEAVY_TRUCK',
    massKg: 44000,
    massTonnes: 44.0,
    staticForceKn: 431.6, // 44000 * 9.81 / 1000
    axleCount: 5,
    axleSpacingM: [3.8, 1.35, 6.2, 1.35],
    lane: -1, // Westbound
    positionX: -14,
    speedMps: 11.0, // 40 km/h
    lengthM: 16.5,
    widthM: 2.6,
    heightM: 4.0,
    colorHex: '#f97316',
  },
  {
    id: 'veh-overload-01',
    name: 'Heavy Industrial Overload Transporter',
    vehicleClass: 'OVERLOAD_FREIGHT',
    massKg: 65000,
    massTonnes: 65.0,
    staticForceKn: 637.7, // 65000 * 9.81 / 1000
    axleCount: 7,
    axleSpacingM: [3.2, 1.3, 1.3, 5.0, 1.3, 1.3],
    lane: 1, // Eastbound
    positionX: 6,
    speedMps: 8.5, // 30 km/h
    lengthM: 22.0,
    widthM: 3.0,
    heightM: 4.2,
    colorHex: '#ef4444',
  },
];
