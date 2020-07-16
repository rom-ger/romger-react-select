import React from 'react';
import classnames from 'classnames';
import { RgReactCheckbox } from '@romger/react-checkbox';
import { RgReactInput } from '@romger/react-input';
import { FlexBox } from '@romger/react-flex-layout';
import { findIndex } from 'lodash';
import { componentWillAppendToBody } from 'react-append-to-body';

class RgReactSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchString: this.getSearchString(),
            modelSearchString: !!this.getSearchString(),
            items: [],
            showItems: false,
            hoverItemIndex: -1
        };
        this.maxId = 1000000;
        this.DEFAULT_VISIBLE_FIELD = 'title';
        this.DEFAULT_MODEL_FIELD = 'id';
        this.DEFAULT_PREFIX_CLASS = 'rg-dictionary-select';
        this.DEFAULT_TIMEOUT_UPDATE = 500;
        this.KEY_CODE_DOWN = 40;
        this.KEY_CODE_UP = 38;
        this.KEY_CODE_ENTER = 13;
        this.wrap = null;
        this.input = null;
        this.singleItem = null;
        this.timeoutCollections = {};
    }

    get iconMinClose() {
        return <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5.5 5.5L9.5 9.5M13.5 13.5L9.5 9.5M9.5 9.5L13.5 5.5M9.5 9.5L5.5 13.5"
                stroke="#767F8D"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>;
    }

    get iconLink() {
        return <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.66571 3.13289L8.93666 3.84893C8.62203 4.15794 8.62203 4.65822 8.93666 4.96645C9.25049 5.27547 9.76066 5.27547 10.0745 4.96645L10.8405 4.21485C11.5921 3.47668 12.8177 3.33205 13.6417 3.99118C14.5888 4.7499 14.6419 6.12745 13.7994 6.95493L11.5414 9.17259C10.748 9.95265 9.46051 9.95265 8.66709 9.17259L7.80447 8.32536L6.66664 9.44368L7.52846 10.2901C8.94551 11.6811 11.263 11.6811 12.6793 10.2901L14.938 8.07245C16.4412 6.59533 16.3486 4.12159 14.6604 2.76696C13.1886 1.58779 11.0087 1.81382 9.66571 3.13289Z"
                fill="white"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.33429 14.0894L9.06334 13.3733C9.37797 13.0643 9.37797 12.564 9.06334 12.2558C8.74951 11.9468 8.23934 11.9468 7.92551 12.2558L7.15945 13.0074C6.40787 13.7456 5.18234 13.8902 4.35834 13.2311C3.41122 12.4724 3.35811 11.0948 4.20062 10.2673L6.45857 8.04966C7.25199 7.26961 8.53949 7.26961 9.33291 8.04966L10.1955 8.8969L11.3334 7.77858L10.4715 6.93214C9.05449 5.54115 6.73699 5.54115 5.32074 6.93214L3.06199 9.1498C1.55883 10.6269 1.65137 13.1007 3.3396 14.4553C4.81137 15.6345 6.99127 15.4084 8.33429 14.0894Z"
                fill="white"
            />
        </svg>;
    }

    get iconArrowDown() {
        return <svg
            className={classnames(
                'select-icon'
            )}
            version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="24px" height="24px" viewBox="0 0 24 24" enableBackground="new 0 0 24 24">
            <path d="M7.41,8.59L12,13.17l4.59-4.58L18,10l-6,6l-6-6L7.41,8.59z" />
            <path fill="none" d="M0,0h24v24H0V0z" />
        </svg>;
    }

    get iconClose() {
        return <svg
            className={classnames(
                'select-icon'
            )}
            version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="24px" height="24px" viewBox="0 0 24 24" enableBackground="new 0 0 24 24" >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            <path d="M0 0h24v24H0z" fill="none" />
        </svg>;
    }

    componentWillReceiveProps(newProps) {
        if (!newProps.multiple && (!this.isSelectedItem(newProps.model) || this.getNameByItem(this.props.model) !== this.getNameByItem(newProps.model))) {
            this.setState({
                searchString: this.getSearchString(newProps),
                modelSearchString: !!newProps.model
            });
        }
        if (this.state.showItems && this.props.multiple) {
            window.setTimeout(() => this.showItems(), 0);
        }
    }

    componentWillUnmount() {
        this.removeScrollListener();
    }

    componentDidMount() {
        this.addScrollListener();
    }

    /**
     * Добавляем прослушиватель скрола
     */
    addScrollListener = () => {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                // IE9+, FF17+, Ch31+
                document.addEventListener('wheel', this.onWheel);
            }
            else if ('onmousewheel' in document) {
                // устаревший вариант события
                document.addEventListener('mousewheel', this.onWheel);
            }
            else {
                // Firefox < 17
                document.addEventListener('MozMousePixelScroll', this.onWheel);
            }
        }
        else { // IE8-
            document.attachEvent('onmousewheel', this.onWheel);
        }
        window.addEventListener('resize', this.onWheel);
    }

    /**
     * Удаляем прослушиватель скрола
     */
    removeScrollListener = () => {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                // IE9+, FF17+, Ch31+
                document.removeEventListener('wheel', this.onWheel);
            }
            else if ('onmousewheel' in document) {
                // устаревший вариант события
                document.removeEventListener('mousewheel', this.onWheel);
            }
            else {
                // Firefox < 17
                document.removeEventListener('MozMousePixelScroll', this.onWheel);
            }
        }
        else { // IE8-
            document.detachEvent('onmousewheel', this.onWheel);
        }
        window.removeEventListener('resize', this.onWheel);
    }

    /**
     * Что делать при скроле
     */
    onWheel = () => {
        if (!this.state.showItems) {
            return;
        }
        const timeout = 300;
        window.setTimeout(() => this.checkPositionWrap(), timeout);
    }

    /**
     * Получить поисковую строку
     * @param {*} props
     */
    getSearchString(props = this.props) {
        if (props.notRemove || props.disabled) {
            return this.state && this.state.searchString ? this.state.searchString : '';
        }
        return !!props.multiple
            ? ''
            : !!props.model
                ? props.withoutField
                    ? props.model
                    : props.model[props.visibleField
                        ? props.visibleField
                        : this.DEFAULT_VISIBLE_FIELD]
                : '';
    }

    /**
     * Получить отображаемое имя элемента
     * @param {*} item
     */
    getNameByItem(item) {
        return !!item ? this.props.withoutField ? item : item[this.props.visibleField ? this.props.visibleField : this.DEFAULT_VISIBLE_FIELD] : '';
    }

    /**
     * Загрузить элементы
     */
    loadItems() {
        let result = this.props.items(this.state.modelSearchString ? '' : this.state.searchString);
        if (result instanceof Promise) {
            result.then(res => this.setState({ items: res }, () => this.showItems()));
        }
        else {
            this.setState({ items: result }, () => this.showItems());
        }
    }

    get top() {
        let _input = !!this.props.notRemove || !!this.props.disabled ? this.props.multiple ? this.input : this.props.model ? this.singleItem : this.input : this.input;
        if (!_input) {
            return '';
        }
        let offset = _input.getBoundingClientRect();
        let availableBottom = offset.top + _input.clientHeight + this.wrap.clientHeight <= window.innerHeight;
        return availableBottom ? (offset.top + _input.clientHeight) + 'px' : (offset.top - this.wrap.clientHeight) + 'px';
    }

    get left() {
        let _input = !!this.props.notRemove || !!this.props.disabled ? this.props.multiple ? this.input : this.props.model ? this.singleItem : this.input : this.input;
        if (!_input) {
            return '';
        }
        let offset = _input.getBoundingClientRect();
        let availableRight = offset.left + this.wrap.clientWidth <= window.innerWidth;
        return availableRight ? (offset.left) + 'px' : (window.innerWidth - this.wrap.clientWidth) + 'px';
    }

    /**
     * Показать выпадашку с вариантами
     */
    showItems() {
        this.setState({
            showItems: true,
            hoverItemIndex: -1
        }, () => {
            this.checkPositionWrap();
            window.addEventListener('keydown', this.callbackPressKey);
        });
    }

    /**
     * Установить верную позицию выпадашки
     */
    checkPositionWrap() {
        let _input = !!this.props.notRemove || !!this.props.disabled ? this.props.multiple ? this.input : this.props.model ? this.singleItem : this.input : this.input;
        let offset = _input.getBoundingClientRect();
        let availableBottom = offset.top + _input.clientHeight + this.wrap.clientHeight <= window.innerHeight;
        let availableRight = offset.left + this.wrap.clientWidth <= window.innerWidth;
        this.wrap.style.minWidth = _input.clientWidth + 'px';
        this.minWidth = this.wrap.style.minWidth;
        this.wrap.style.left = availableRight ? (offset.left) + 'px' : (window.innerWidth - this.wrap.clientWidth) + 'px';
        this.wrap.style.top = availableBottom ? (offset.top + _input.clientHeight) + 'px' : (offset.top - this.wrap.clientHeight) + 'px';
        if (this.wrap.style.left === '0px' && this.wrap.style.top === '0px') {
            this.hideItems();
            return;
        }
        this.handlerOutsideClick([this.wrap, _input], () => {
            if (!!this.state.showItems) {
                this.hideItems();
            }
        }, true);
    }

    /**
     * Скрыть выпадашку с вариантами
     */
    hideItems() {
        this.setState({
            showItems: false,
        }, () => window.removeEventListener('keydown', this.callbackPressKey));
    }

    /**
     * Этот элемент уже выбран
     * @param {*} item
     */
    isSelectedItem(item) {
        if (!this.props.model && !item) {
            return true;
        }
        if (!!this.props.model && !item || !this.props.model && !!item) {
            return false;
        }
        if (this.props.multiple) {
            return this.props.model && this.props.model.length && findIndex(this.props.model, el => (this.props.withoutField || !el ? el : el[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD]) === (this.props.withoutField || !item ? item : item[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD])) > -1;
        }
        else {
            return this.props.model && (this.props.withoutField || !this.props.model ? this.props.model : this.props.model[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD]) === (this.props.withoutField || !item ? item : item[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD]);
        }
    }

    /**
     * Выбрать/Развыбрать элемент
     * @param {*} item
     */
    toggleItem(item) {
        if (this.isSelectedItem(item)) {
            this.removeItemFromModel(item);
        }
        else {
            this.addItemToModel(item);
        }
        this.setState({
            checkModel: true
        });
    }

    /**
     * Развыбрать элемент
     * @param {*} item
     */
    removeItemFromModel(item) {
        if (this.props.notRemove) {
            return this.hideItems();
        }
        let model = this.props.model;
        if (this.props.multiple) {
            let index = findIndex(this.props.model, el => (this.props.withoutField ? el : el[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD]) === (this.props.withoutField ? item : item[this.props.modelField ? this.props.modelField : this.DEFAULT_MODEL_FIELD]));
            if (index > -1) {
                model.splice(index, 1);
            }
        }
        else {
            model = null;
            this.hideItems();
            this.setState(
                { modelSearchString: false },
                () => this.translateSearchStringToParentComponent(),
            );
        }
        return this.props.updateModelHandler(model);
    }

    /**
     * Выбрать элемент
     * @param {*} item
     */
    addItemToModel(item) {
        let model = this.props.model;
        if (this.props.multiple) {
            model.push(item);
        }
        else {
            model = item;
            this.hideItems();
            this.setState(
                { modelSearchString: true },
                () => this.translateSearchStringToParentComponent(),
            );
        }
        return this.props.updateModelHandler(model);
    }

    translateSearchStringToParentComponent = () => {
        if (this.props.searchStringTranslate) {
            this.props.searchStringTranslate(this.state.searchString);
        }
    };

    /**
     * Получить объект стилей для элемента выпадающего меню
     * @param {*} item
     * @param {*} prefixClass
     */
    getStyleItem(item, index, prefixClass) {
        let style = {};
        style[this.DEFAULT_PREFIX_CLASS + '__items-item--selected'] = this.isSelectedItem(item);
        style[prefixClass + '__items-item--selected'] = this.isSelectedItem(item);
        style[this.DEFAULT_PREFIX_CLASS + '__items-item--hover'] = this.state.hoverItemIndex === index;
        style[prefixClass + '__items-item--hover'] = this.state.hoverItemIndex === index;
        return style;
    }

    /**
     * Выполнить колбэк с таймаутом
     * @param {*} field
     * @param {*} callback
     * @param {*} timeout
     */
    clearTimeoutPause(field, callback, timeout) {
        window.setTimeout(() => {
            if (this.timeoutCollections[field] + timeout <= new Date().getTime()) {
                return callback();
            }
        }, timeout);
    }

    wrapperItems({ children }) {
        return <div>{children}</div>;
    }

    /**
     * Колбэк на клик по документу, чтобы что-нибудь сделать, если кликнули за пределы элемента
     * @param nodeArray
     * @param callbackOutside
     * @param removeHandler
     */
    handlerOutsideClick(nodeArray, callbackOutside, removeHandler = false) {
        document.addEventListener('click', (evt) => {
            let targetElement = evt.target;
            do {
                if (nodeArray.findIndex(el => el === targetElement) > -1 || !targetElement) {
                    return;
                }
                targetElement = targetElement.parentNode;
            } while (targetElement);
            callbackOutside();
        }, {
                once: !!removeHandler
            });
    }

    /**
     * Обновляем поле в стэйте
     */
    updateState = (value, field, callback = null, timeout = this.DEFAULT_TIMEOUT_UPDATE) => {
        let updateObj = {};
        updateObj[field] = value;
        this.setState(updateObj, () => {
            this.checkPositionWrap();
            if (!callback) {
                return;
            }
            this.timeoutCollections[field] = new Date().getTime();
            return this.clearTimeoutPause(field, callback, timeout);
        });
    }

    /**
     * Получить объект стилей для родительского элемента
     * @param {*} prefixClass
     * @param {*} iconSvg
     */
    getStyleParent(prefixClass) {
        let style = {};
        style[this.DEFAULT_PREFIX_CLASS + '--required'] = !!this.props.required;
        style[prefixClass + '--required'] = !!this.props.required;
        return style;
    }

    /**
     * Следим за нажатием клавиш
     */
    callbackPressKey = (e) => {
        if (!this.state.items.length) {
            return;
        }
        if (e.keyCode === this.KEY_CODE_ENTER) {
            if (this.state.hoverItemIndex === -1) {
                return;
            }
            e.preventDefault();
            this.toggleItem(this.state.items[this.state.hoverItemIndex]);
            return;
        }
        let newIndex = this.state.hoverItemIndex;
        if (e.keyCode === this.KEY_CODE_DOWN) {
            e.preventDefault();
            newIndex++;
            if (newIndex === this.state.items.length) {
                newIndex = 0;
            }
        }
        if (e.keyCode === this.KEY_CODE_UP) {
            e.preventDefault();
            newIndex--;
            if (newIndex < 0) {
                newIndex = this.state.items.length - 1;
            }
        }
        this.setState({
            hoverItemIndex: newIndex,
        }, () => this.checkPositionWrap());
    }

    /**
     * На этот элемент есть экшен в конфиге
     */
    isItemWithAction = (item) => {
        let itemsActionConfig = this.props.itemsActionConfig;
        if (!itemsActionConfig || !this.props.modelField || !item[this.props.modelField]) {
            return false;
        }
        let index = itemsActionConfig.findIndex(el => item[this.props.modelField] === el.modelValue);
        if (index === -1) {
            return false;
        }
        return true;
    }

    /**
     * На этот элемент есть экшен в конфиге
     */
    getItemActionConfig = (item) => {
        let itemsActionConfig = this.props.itemsActionConfig;
        if (!itemsActionConfig || !this.props.modelField || !item[this.props.modelField]) {
            return null;
        }
        let index = itemsActionConfig.findIndex(el => item[this.props.modelField] === el.modelValue);
        if (index === -1) {
            return null;
        }
        return itemsActionConfig[index];
    }

    render() {
        const prefixClass = this.props.prefixClass ? this.props.prefixClass : this.DEFAULT_PREFIX_CLASS;
        const disabled = this.props.disabled;
        let styleLabel = null;
        if (this.props.widthLabel) {
            styleLabel = {
                width: `${this.props.widthLabel}px`
            };
        }
        const AppendedWrapperItems = componentWillAppendToBody(this.wrapperItems);
        return (
            <div className={classnames(
                this.DEFAULT_PREFIX_CLASS,
                prefixClass,
                this.getStyleParent(prefixClass)
            )}>
                {
                    !!this.props.label && !!this.props.topLabel &&
                        <div className={classnames(
                            this.DEFAULT_PREFIX_CLASS + '__label',
                            prefixClass + '__label'
                        )}>
                            {this.props.label}
                            {this.props.required ? <span>{' *'}</span> : ''}
                        </div>
                }
                <FlexBox
                    row="start center"
                    className={classnames(
                        this.DEFAULT_PREFIX_CLASS + '__input-wrap',
                        prefixClass + '__input-wrap'
                    )}
                >

                    {
                        !!this.props.label && !this.props.topLabel &&
                        <div
                            className={classnames(
                                this.DEFAULT_PREFIX_CLASS + '__label',
                                prefixClass + '__label',
                                this.DEFAULT_PREFIX_CLASS + '__label--left',
                                prefixClass + '__label--left'
                            )}
                            style={styleLabel}
                        >
                            {this.props.label}
                            {this.props.required ? <span>{' *'}</span> : ''}
                        </div>
                    }
                    {
                        !!this.props.multiple &&
                        <div
                            className={classnames(
                                this.DEFAULT_PREFIX_CLASS + '__multi-wrap',
                                prefixClass + '__multi-wrap',
                                {
                                    [this.DEFAULT_PREFIX_CLASS + '__multi-wrap--empty']: !this.props.model || !this.props.model.length,
                                    [prefixClass + '__multi-wrap--empty']: !this.props.model || !this.props.model.length,
                                    [this.DEFAULT_PREFIX_CLASS + '__multi-wrap--disabled']: !!disabled,
                                    [prefixClass + '__multi-wrap--disabled']: !!disabled,
                                    [this.DEFAULT_PREFIX_CLASS + '__multi-wrap--error']: (!this.props.model || !this.props.model.length) && !!this.props.required && !!this.state.checkModel,
                                    [prefixClass + '__multi-wrap--error']: (!this.props.model || !this.props.model.length) && !!this.props.required && !!this.state.checkModel
                                }
                            )}
                            ref={node => this.input = node}
                        >
                            {
                                !!this.props.multiple && !!this.props.model && !!this.props.model.length && this.props.model.map((item, key) =>
                                    <FlexBox
                                        row="start center"
                                        key={key}
                                        className={classnames(
                                            this.DEFAULT_PREFIX_CLASS + '__model-item',
                                            prefixClass + '__model-item',
                                            {
                                                [this.DEFAULT_PREFIX_CLASS + '__model-item--action']: this.isItemWithAction(item),
                                                [prefixClass + '__model-item--action']: this.isItemWithAction(item)
                                            }
                                        )}
                                        onClick={() => this.isItemWithAction(item) ? this.getItemActionConfig(item).onClick(item) : null}
                                    >
                                        {
                                            !!this.isItemWithAction(item) && (!!this.getItemActionConfig(item).icon || !!this.getItemActionConfig(item).defaultIcon) &&
                                            <FlexBox
                                                className={classnames(
                                                    this.DEFAULT_PREFIX_CLASS + '__model-item-action-click',
                                                    prefixClass + '__model-item-action-click',
                                                )}
                                            >
                                                {this.getItemActionConfig(item).icon ? this.getItemActionConfig(item).icon : this.iconLink}
                                            </FlexBox>
                                        }
                                        <span
                                            onClick={(e) => null}
                                            title={this.props.withoutField ? item : item[this.props.visibleField ? this.props.visibleField : this.DEFAULT_VISIBLE_FIELD]}
                                        >
                                            {this.props.withoutField ? item : item[this.props.visibleField ? this.props.visibleField : this.DEFAULT_VISIBLE_FIELD]}
                                        </span>
                                        {
                                            !disabled && !this.props.notRemove &&
                                            <FlexBox
                                                row="end center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.toggleItem(item);
                                                }}>
                                                {this.iconMinClose}
                                            </FlexBox>
                                        }
                                    </FlexBox>
                                )
                            }
                            {
                                !disabled &&
                                <FlexBox
                                    row="stretch start"
                                    className={classnames(
                                        this.DEFAULT_PREFIX_CLASS + '__multi-wrap-input',
                                        prefixClass + '__multi-wrap-input',
                                    )}
                                    flex
                                >
                                    <RgReactInput
                                        value={this.state.searchString}
                                        prefixClass={this.props.prefixClass}
                                        placeholder={this.props.placeholder ? this.props.placeholder : ''}
                                        withoutBlurValidation={true}
                                        iconHTML={this.iconArrowDown}
                                        iconCallback={(e) => this.state.showItems ? this.hideItems() : this.loadItems()}
                                        onClickCallback={(e) => this.state.showItems ? this.hideItems() : this.loadItems()}
                                        updateCallback={
                                            (e) => {
                                                this.updateState(
                                                    e && e.target && e.target.value ? e.target.value : '',
                                                    'searchString',
                                                    () => {
                                                        this.loadItems();
                                                        this.translateSearchStringToParentComponent();
                                                    }
                                                );
                                            }
                                        }
                                    />
                                </FlexBox>
                            }
                        </div>
                    }
                    {
                        !!this.props.multiple && (!this.props.model || !this.props.model.length) && !!this.props.required && !!this.state.checkModel &&
                        <div
                            className={classnames(
                                this.DEFAULT_PREFIX_CLASS + '__multi-error',
                                prefixClass + '__multi-error'
                            )}
                        >
                            Это поле обязательно для заполнения
                        </div>
                    }
                    {
                        !this.props.multiple &&
                        <FlexBox
                            flex={true}
                        >
                            {
                                !!this.props.model && (!!this.props.notRemove || disabled) &&
                                <div ref={node => this.singleItem = node}>
                                    <FlexBox
                                        row="start center"
                                        className={classnames(
                                            this.DEFAULT_PREFIX_CLASS + '__model-single-item',
                                            prefixClass + '__model-single-item',
                                            {
                                                [this.DEFAULT_PREFIX_CLASS + '__model-single-item--disabled']: !!disabled,
                                                [prefixClass + '__model-single-item--disabled']: !!disabled,
                                            }
                                        )}
                                        onClick={() => {
                                            if (disabled) {
                                                return;
                                            }
                                            if (!!this.state.showItems) {
                                                this.hideItems();
                                            }
                                            else {
                                                this.loadItems();
                                            }
                                        }}>
                                        <FlexBox
                                            flex={true}
                                            element="span">
                                            {this.props.withoutField ? this.props.model : this.props.model[this.props.visibleField ? this.props.visibleField : this.DEFAULT_VISIBLE_FIELD]}
                                        </FlexBox>
                                        {
                                            !disabled &&
                                            <FlexBox
                                                row="end center">
                                                {this.iconArrowDown}
                                            </FlexBox>
                                        }
                                    </FlexBox>
                                </div>
                            }
                            {
                                !!this.props.model && !this.props.notRemove && !disabled &&
                                <div
                                    ref={node => this.input = node}
                                    className={classnames(
                                        this.DEFAULT_PREFIX_CLASS + '__input-wrap',
                                        prefixClass + '__input-wrap'
                                    )}>
                                    <RgReactInput
                                        value={this.state.searchString}
                                        prefixClass={this.props.prefixClass}
                                        placeholder={this.props.placeholder ? this.props.placeholder : ''}
                                        onClickCallback={(e) => this.state.showItems ? this.hideItems() : this.loadItems()}
                                        iconHTML={this.iconClose}
                                        withoutBlurValidation={true}
                                        dictionaryCallback={this.props.openDictionaryCallback ? () => {
                                            this.hideItems();
                                            this.props.openDictionaryCallback();
                                        } : null}
                                        iconCallback={() => this.removeItemFromModel(this.props.model)}
                                        updateCallback={(e) => this.updateState(
                                            e.target.value,
                                            'searchString',
                                            () => {
                                                this.translateSearchStringToParentComponent();
                                                this.updateState(
                                                    false,
                                                    'modelSearchString',
                                                    () => this.loadItems(),
                                                );
                                            },
                                            0,
                                        )}
                                    />
                                </div>
                            }
                            {
                                !this.props.model &&
                                <div
                                    ref={node => this.input = node}
                                    className={classnames(
                                        this.DEFAULT_PREFIX_CLASS + '__input-wrap',
                                        prefixClass + '__input-wrap'
                                    )}>
                                    <RgReactInput
                                        value={this.state.searchString}
                                        disabled={disabled}
                                        prefixClass={this.props.prefixClass}
                                        placeholder={this.props.placeholder ? this.props.placeholder : ''}
                                        withoutBlurValidation={true}
                                        iconHTML={disabled ? undefined : this.iconArrowDown}
                                        iconCallback={(e) => (disabled || this.state.showItems) ? this.hideItems() : this.loadItems()}
                                        dictionaryCallback={this.props.openDictionaryCallback ? () => {
                                            this.hideItems();
                                            this.props.openDictionaryCallback();
                                        } : null}
                                        onClickCallback={(e) => (disabled || this.state.showItems) ? this.hideItems() : this.loadItems()}
                                        updateCallback={
                                            (e) => {
                                                this.updateState(
                                                    e && e.target && e.target.value ? e.target.value : '',
                                                    'searchString',
                                                    () => {
                                                        this.loadItems();
                                                        this.translateSearchStringToParentComponent();
                                                    }
                                                );
                                            }
                                        }
                                        error={!disabled && !!this.state.checkModel && !!this.props.required ? 'Это поле обязательно для заполнения' : null}
                                    />
                                </div>
                            }
                        </FlexBox>
                    }
                </FlexBox>
                <AppendedWrapperItems>
                    <div
                        className={classnames(
                            this.DEFAULT_PREFIX_CLASS + '__items-wrap',
                            prefixClass + '__items-wrap'
                        )}
                        ref={node => this.wrap = node}
                        style={{
                            display: this.state.showItems ? 'block' : 'none',
                            top: this.top,
                            left: this.left,
                            minWidth: this.minWidth
                        }}>
                        {
                            !!this.state.items.length && this.state.items.map((item, key) =>
                                <FlexBox
                                    key={key}
                                    className={classnames(
                                        this.DEFAULT_PREFIX_CLASS + '__items-item',
                                        prefixClass + '__items-item',
                                        this.getStyleItem(item, key, prefixClass)
                                    )}
                                    onClick={() => this.toggleItem(item)}
                                    row="start center"
                                >
                                    {
                                        !!this.props.multiple &&
                                        <RgReactCheckbox
                                            checked={this.isSelectedItem(item)}
                                        />
                                    }
                                    <FlexBox
                                        flex
                                        className={classnames(
                                            {
                                                [this.DEFAULT_PREFIX_CLASS + '__items-item-title--multi-select']: !!this.props.multiple,
                                                [prefixClass + '__items-item-title--multi-select']: !!this.props.multiple,
                                            },
                                        )}
                                    >
                                        {
                                            this.props.itemTemplate
                                                ?
                                                this.props.itemTemplate(item)
                                                :
                                                (
                                                    this.props.withoutField ? item : item[this.props.visibleField ? this.props.visibleField : this.DEFAULT_VISIBLE_FIELD]
                                                )
                                        }
                                    </FlexBox>
                                </FlexBox>
                            )
                        }
                        {
                            !this.state.items.length &&
                            <div
                                className={classnames(
                                    this.DEFAULT_PREFIX_CLASS + '__items-item',
                                    prefixClass + '__items-item'
                                )}
                                onClick={() => this.hideItems()}>
                                Ничего не найдено
                            </div>
                        }
                    </div>
                </AppendedWrapperItems>
            </div>
        );
    }
}

export default RgReactSelect;
