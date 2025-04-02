// THIS IS A NOVA SECTOR UI FILE
import { Feature, FeatureNumberInput } from '../../base'; // ARK STATION EDIT

export const chrono_age: Feature<number> = {
  name: 'Age (Chronological)',
  description:
    'Chronological age represents how long your character has actually existed in the universe since birth.\
    Includes time spent in cryo-sleep and/or in areas of gravity/speed-induced time dilation.',
  component: FeatureNumberInput, // ARK STATION EDIT
};
