import mongoose from 'mongoose';

import { ZetkinArea, ZetkinPlace } from './types';

type ZetkinAreaModelType = {
  description: string | null;
  orgId: number;
  points: ZetkinArea['points'];
  title: string | null;
};

type ZetkinPlaceModelType = {
  description: string | null;
  orgId: number;
  position: ZetkinPlace['position'];
  title: string | null;
  type: 'address' | 'misc';
  visits: ZetkinPlace['visits'];
};

const areaSchema = new mongoose.Schema<ZetkinAreaModelType>({
  description: String,
  orgId: { required: true, type: Number },
  points: Array,
  title: String,
});

const placeSchema = new mongoose.Schema<ZetkinPlaceModelType>({
  description: String,
  orgId: { required: true, type: Number },
  position: Object,
  title: String,
  type: String,
  visits: Array,
});

export const AreaModel: mongoose.Model<ZetkinAreaModelType> =
  mongoose.models.Area ||
  mongoose.model<ZetkinAreaModelType>('Area', areaSchema);

export const PlaceModel: mongoose.Model<ZetkinPlaceModelType> =
  mongoose.models.Place ||
  mongoose.model<ZetkinPlaceModelType>('Place', placeSchema);
