import { sortBy } from 'common/collections'; // ARK STATION EDIT
import { BooleanLike, classes } from 'common/react'; // ARK STATION EDIT
import {
  ComponentType,
  createElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { sendAct, useBackend } from '../../../../backend';
import {
  Box,
  Button,
  Dropdown,
  Input,
  NumberInput,
  Slider,
  Stack,
  TextArea,
} from '../../../../components'; // EffigyEdit Add
import { createSetPreference, PreferencesMenuData } from '../../data';
import { ServerPreferencesFetcher } from '../../ServerPreferencesFetcher';

export const sortChoices = (array: [string, ReactNode][]) =>
  sortBy(array, ([name]) => name);

export type Feature<
  TReceiving,
  TSending = TReceiving,
  TServerData = undefined,
> = {
  name: string;
  component: FeatureValue<TReceiving, TSending, TServerData>;
  category?: string;
  description?: string;
  small_supplemental?: boolean;
};

/**
 * Represents a preference.
 * TReceiving = The type you will be receiving
 * TSending = The type you will be sending
 * TServerData = The data the server sends through preferences.json
 */
type FeatureValue<
  TReceiving,
  TSending = TReceiving,
  TServerData = undefined,
> = ComponentType<FeatureValueProps<TReceiving, TSending, TServerData>>;

export type FeatureValueProps<
  TReceiving,
  TSending = TReceiving,
  TServerData = undefined,
> = Readonly<{
  act: typeof sendAct;
  featureId: string;
  handleSetValue: (newValue: TSending) => void;
  serverData: TServerData | undefined;
  shrink?: boolean;
  value: TReceiving;
}>;

export const FeatureColorInput = (props: FeatureValueProps<string>) => {
  return (
    <Button
      onClick={() => {
        props.act('set_color_preference', {
          preference: props.featureId,
        });
      }}
    >
      <Stack align="center" fill>
        <Stack.Item>
          <Box
            style={{
              background: props.value.startsWith('#')
                ? props.value
                : `#${props.value}`,
              border: '2px solid white',
              boxSizing: 'content-box',
              height: '11px',
              width: '11px',
              ...(props.shrink
                ? {
                    margin: '1px',
                  }
                : {}),
            }}
          />
        </Stack.Item>

        {!props.shrink && <Stack.Item>Change</Stack.Item>}
      </Stack>
    </Button>
  );
};

export type FeatureToggle = Feature<BooleanLike, boolean>;

export const CheckboxInput = (
  props: FeatureValueProps<BooleanLike, boolean>,
) => {
  return (
    <Button.Checkbox
      checked={!!props.value}
      onClick={() => {
        props.handleSetValue(!props.value);
      }}
    />
  );
};

export const CheckboxInputInverse = (
  props: FeatureValueProps<BooleanLike, boolean>,
) => {
  return (
    <Button.Checkbox
      checked={!props.value}
      onClick={() => {
        props.handleSetValue(!props.value);
      }}
    />
  );
};

export const createDropdownInput = <T extends string | number = string>(
  // Map of value to display texts
  choices: Record<T, ReactNode>,
  dropdownProps?: Record<T, unknown>,
): FeatureValue<T> => {
  // ARK STATION EDIT
  return (props: FeatureValueProps<T>) => {
    return (
      <Dropdown
        selected={choices[props.value] as string}
        onSelected={props.handleSetValue}
        width="100%"
        options={sortChoices(Object.entries(choices)).map(
          ([dataValue, label]) => {
            return {
              displayText: label,
              value: dataValue,
            };
          },
        )}
        {...dropdownProps}
      />
    );
  };
};

export type FeatureChoicedServerData = {
  choices: string[];
  display_names?: Record<string, string>;
  icons?: Record<string, string>;
};

export type FeatureChoiced = Feature<string, string, FeatureChoicedServerData>;

const capitalizeFirstLetter = (text: string) =>
  text.toString().charAt(0).toUpperCase() + text.toString().slice(1);

export const StandardizedDropdown = (props: {
  choices: string[];
  disabled?: boolean;
  displayNames: Record<string, ReactNode>;
  onSetValue: (newValue: string) => void;
  value: string;
  buttons?: boolean;
}) => {
  const { choices, disabled, buttons, displayNames, onSetValue, value } = props;

  return (
    <Dropdown
      disabled={disabled}
      buttons={buttons}
      selected={value}
      onSelected={onSetValue}
      width="100%"
      displayText={displayNames[value]}
      options={choices.map((choice) => {
        return {
          displayText: displayNames[choice],
          value: choice,
        };
      })}
    />
  );
};

export const FeatureButtonedDropdownInput = (
  props: FeatureValueProps<string, string, FeatureChoicedServerData> & {
    disabled?: boolean;
  },
) => {
  return <FeatureDropdownInput disabled={props.disabled} buttons {...props} />;
};

export const FeatureDropdownInput = (
  props: FeatureValueProps<string, string, FeatureChoicedServerData> & {
    disabled?: boolean;
    buttons?: boolean;
  },
) => {
  const serverData = props.serverData;
  if (!serverData) {
    return null;
  }

  const displayNames =
    serverData.display_names ||
    Object.fromEntries(
      serverData.choices.map((choice) => [
        choice,
        capitalizeFirstLetter(choice),
      ]),
    );

  return serverData.choices.length > 7 ? (
    <StandardizedDropdown
      choices={sortBy(serverData.choices)}
      disabled={props.disabled}
      buttons={props.buttons}
      displayNames={displayNames}
      onSetValue={props.handleSetValue}
      value={props.value}
    />
  ) : (
    <StandardizedChoiceButtons
      choices={sortBy(serverData.choices)}
      disabled={props.disabled}
      displayNames={displayNames}
      onSetValue={props.handleSetValue}
      value={props.value}
    />
  );
};

export const FeatureForcedDropdownInput = (
  props: FeatureValueProps<string, string, FeatureChoicedServerData> & {
    disabled?: boolean;
    buttons?: boolean;
  },
) => {
  const serverData = props.serverData;
  if (!serverData) {
    return null;
  }

  const displayNames =
    serverData.display_names ||
    Object.fromEntries(
      serverData.choices.map((choice) => [
        choice,
        capitalizeFirstLetter(choice),
      ]),
    );

  return (
    <StandardizedDropdown
      choices={sortBy(serverData.choices)}
      disabled={props.disabled}
      buttons={props.buttons}
      displayNames={displayNames}
      onSetValue={props.handleSetValue}
      value={props.value}
    />
  );
};

export type FeatureWithIcons<T> = Feature<
  // ARK STATION EDIT
  { value: T },
  T,
  FeatureChoicedServerData
>;

export const FeatureIconnedDropdownInput = (
  // ARK STATION EDIT
  props: FeatureValueProps<
    {
      value: string;
    },
    string,
    FeatureChoicedServerData
  > & {
    buttons?: boolean;
  },
) => {
  const serverData = props.serverData;
  if (!serverData) {
    return null;
  }

  const icons = serverData.icons;

  const textNames =
    serverData.display_names ||
    Object.fromEntries(
      serverData.choices.map((choice) => [
        choice,
        capitalizeFirstLetter(choice),
      ]),
    );

  const displayNames = Object.fromEntries(
    Object.entries(textNames).map(([choice, textName]) => {
      let element: ReactNode = textName;

      if (icons && icons[choice]) {
        const icon = icons[choice];
        element = (
          <Stack>
            <Stack.Item>
              <Box
                className={classes(['preferences32x32', icon])}
                style={{
                  transform: 'scale(0.8)',
                }}
              />
            </Stack.Item>

            <Stack.Item grow>{element}</Stack.Item>
          </Stack>
        );
      }

      return [choice, element];
    }),
  );

  return (
    <StandardizedDropdown
      buttons={props.buttons}
      choices={sortBy(serverData.choices)}
      displayNames={displayNames}
      onSetValue={props.handleSetValue}
      value={props.value.value}
    />
  );
};

export const StandardizedChoiceButtons = (props: {
  choices: string[];
  disabled?: boolean;
  displayNames: Record<string, ReactNode>;
  onSetValue: (newValue: string) => void;
  value?: string;
}) => {
  const { choices, disabled, displayNames, onSetValue, value } = props;
  return (
    <>
      {choices.map((choice) => (
        <Button
          key={choice}
          content={displayNames[choice]}
          selected={choice === value}
          disabled={disabled}
          onClick={() => onSetValue(choice)}
        />
      ))}
    </>
  );
};

export type HexValue = {
  lightness: number;
  value: string;
};
export type FeatureNumericData = {
  minimum: number;
  maximum: number;
  step: number;
};

export type FeatureNumeric = Feature<number, number, FeatureNumericData>;

export const FeatureNumberInput = (
  props: FeatureValueProps<number, number, FeatureNumericData>,
) => {
  if (!props.serverData) {
    return <Box>Loading...</Box>;
  }

  return (
    <NumberInput
      onChange={(value) => {
        props.handleSetValue(value);
      }}
      minValue={props.serverData.minimum}
      maxValue={props.serverData.maximum}
      step={props.serverData.step}
      value={props.value}
    />
  );
};

export const FeatureSliderInput = (
  props: FeatureValueProps<number, number, FeatureNumericData>,
) => {
  if (!props.serverData) {
    return <Box>Loading...</Box>;
  }

  return (
    <Slider
      onChange={(e, value) => {
        props.handleSetValue(value);
      }}
      minValue={props.serverData.minimum}
      maxValue={props.serverData.maximum}
      step={props.serverData.step}
      value={props.value}
      stepPixelSize={10}
    />
  );
};

export const FeatureValueInput = (props: {
  feature: Feature<unknown>;
  featureId: string;
  shrink?: boolean;
  value: unknown;

  act: typeof sendAct;
}) => {
  const { data } = useBackend<PreferencesMenuData>();

  const feature = props.feature;

  const [predictedValue, setPredictedValue] = useState(props.value);

  const changeValue = (newValue: unknown) => {
    setPredictedValue(newValue);
    createSetPreference(props.act, props.featureId)(newValue);
  };

  useEffect(() => {
    setPredictedValue(props.value);
  }, [data.active_slot, props.value]);

  return (
    <ServerPreferencesFetcher
      render={(serverData) => {
        return createElement(feature.component, {
          act: props.act,
          featureId: props.featureId,
          serverData: serverData?.[props.featureId] as any,
          shrink: props.shrink,

          handleSetValue: changeValue,
          value: predictedValue,
        });
      }}
    />
  );
};

export type FeatureShortTextData = {
  maximum_length: number;
};

export const FeatureShortTextInput = (
  props: FeatureValueProps<string, string, FeatureShortTextData>,
) => {
  if (!props.serverData) {
    return <Box>Loading...</Box>;
  }

  return (
    <Input
      width="100%"
      value={props.value}
      maxLength={props.serverData.maximum_length}
      updateOnPropsChange
      onChange={(_, value) => props.handleSetValue(value)}
    />
  );
};

// NOVA EDIT ADDITION START - NOVA FEATURES DOWN HERE

export const FeatureTextInput = (
  props: FeatureValueProps<string, string, FeatureShortTextData>,
) => {
  if (!props.serverData) {
    return <Box>Loading...</Box>;
  }

  return (
    <TextArea
      height="100px"
      value={props.value}
      maxLength={props.serverData.maximum_length}
      onChange={(_, value) => props.handleSetValue(value)}
    />
  );
};

export const FeatureTriColorInput = (props: FeatureValueProps<string[]>) => {
  const buttonFromValue = (index) => {
    return (
      <Stack.Item>
        <Button
          onClick={() => {
            props.act('set_tricolor_preference', {
              preference: props.featureId,
              value: index + 1,
            });
          }}
        >
          <Stack align="center" fill>
            <Stack.Item>
              <Box
                style={{
                  background: props.value[index].startsWith('#')
                    ? props.value[index]
                    : `#${props.value[index]}`,
                  border: '2px solid #e6e7eb',
                  boxSizing: 'content-box',
                  height: '11px',
                  width: '11px',
                  ...(props.shrink
                    ? {
                        margin: '1px',
                      }
                    : {}),
                }}
              />
            </Stack.Item>

            {!props.shrink && <Stack.Item>Change</Stack.Item>}
          </Stack>
        </Button>
      </Stack.Item>
    );
  };
  return (
    <Stack align="center" fill>
      {buttonFromValue(0)}
      {buttonFromValue(1)}
      {buttonFromValue(2)}
    </Stack>
  );
};

export const FeatureTriBoolInput = (props: FeatureValueProps<boolean[]>) => {
  const buttonFromValue = (index) => {
    return (
      <Stack.Item align="center">
        <Button.Checkbox
          checked={!!props.value[index]}
          onClick={() => {
            const currentValue = [...props.value];
            currentValue[index] = !currentValue[index];
            props.handleSetValue(currentValue);
          }}
        />
      </Stack.Item>
    );
  };
  return (
    <Stack align="center" fill>
      {buttonFromValue(0)}
      {buttonFromValue(1)}
      {buttonFromValue(2)}
    </Stack>
  );
};
// NOVA EDIT ADDITION END
