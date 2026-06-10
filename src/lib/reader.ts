import { cache } from 'react';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

export const getReader = cache(() => createReader(process.cwd(), keystaticConfig));
