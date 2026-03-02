import { IMenuItem, KeyValue } from '@decaf-ts/for-angular';
import { IAppMenuItem } from './interfaces';

export type StorageEntry = string | number | KeyValue | boolean | null;

export type AccessWhen = 'feature' | 'role' | 'module';

export type MenuLike = IAppMenuItem & IMenuItem;
