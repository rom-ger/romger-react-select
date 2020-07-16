import * as React from 'react';

interface IItemActionConfig {
    modelValue: any;
    icon?: any;
    defaultIcon?: boolean;
    onClick: (item: any) => any;
}

interface RgReactSelectProps {
    multiple?: boolean;
    items?: (searchString?: string) => any;
    itemsActionConfig?: IItemActionConfig[];
    itemTemplate?: (item: any) => false | JSX.Element;
    model?: any;
    modelField?: string;
    withoutField?: Boolean;
    visibleField?: string;
    updateModelHandler?: (model: any) => any;
    prefixClass?: string;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    required?: boolean;
    notRemove?: boolean;
    openDictionaryCallback?: () => any;
    topLabel?: boolean;
    widthLabel?: number;
    searchStringTranslate?: (searchString: string) => any;
}

export class RgReactSelect extends React.Component<RgReactSelectProps, any> {}