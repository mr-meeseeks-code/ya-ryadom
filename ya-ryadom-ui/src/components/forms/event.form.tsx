import './event.form.scss';
import React from 'react';
import {
    FormLayout,
    Input,
    Textarea,
    Button,
    Select,
    FormStatus,
} from '@vkontakte/vkui';
import GoogleMapReact, { ClickEventValue } from 'google-map-react';
import Marker from '../map/marker';
import { MAP } from '../../utils/constants/map.constants';
import { Geo } from '../../store/authentication/models';
import { AppState } from '../../store/app-state';
import { connect } from 'react-redux';
import { UserInfo } from "@vkontakte/vk-bridge";
import { Position } from '../../store/authentication/models';
import isEmpty from "lodash/isEmpty";
import { MyEventCreate } from '../../store/events/events-near-me/models';
import { ALL_THEMES } from '../../utils/constants/theme.constants';
import AutocompleteMap from '../inputs/autocomplete-map.input';
import { Validators } from '../../utils/validation/validators';
import { updateEventForm } from '../../store/events/my-events/actions';
import { EventForm as EventFormModel } from '../../store/events/my-events/models';

interface OwnProps {
    onSave: (myEvent: MyEventCreate) => void;
}

interface PropsFromState {
    userPosition: Geo,
    vkUserInfo: UserInfo,
    lastLocation: Position,
    isOnline: boolean,
    eventForm: EventFormModel,
}

interface PropsFromDispatch {
    updateEventForm: typeof updateEventForm
}


type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

interface EventState {
    errors: any
}

const maxValues = {
    maxDescription: 84,
    maxTitle: 20
}

class EventForm extends React.Component<AllProps, EventState> {

    constructor(props) {
        super(props);
        this.state = {
            errors: {}
        };
        this.onLocationClick = this.onLocationClick.bind(this);
        this.onFillInProfile = this.onFillInProfile.bind(this)
    }

    componentDidMount() {
    }

    onLocationClick = (clickEventValue: ClickEventValue) => {
        const { updateEventForm } = this.props;
        updateEventForm({ name: "selectedPosition", value: { lat: clickEventValue.lat, lng: clickEventValue.lng } });
        this.setState({
            errors: { ...this.state.errors, selectedPosition: undefined }
        });
    }

    onFillInProfile = (data) => {
        if (!this.isValid()) return;
        const { onSave, eventForm } = this.props;
        if (isEmpty(eventForm.selectedPosition)) {
            // TODO handle show error
            console.log('handle error')
        }
        else {
            onSave({
                title: eventForm.eventName,
                longitude: eventForm.selectedPosition.lng,
                latitude: eventForm.selectedPosition.lat,
                date: new Date(eventForm.eventDate).toLocaleDateString('ru-RU', "dd.MM.yyyy" as any),
                time: eventForm.eventTime,
                description: eventForm.eventDescription,
                maxQuantiyty: 50,
                vkUserId: this.props.vkUserInfo.id,
                selectedThemes: [eventForm.selectedTheme],
            });
        }
    }

    handleInputChange = event => {
        event.preventDefault();
        const { updateEventForm } = this.props;
        const { name, value } = event.target;
        updateEventForm({ name, value });
        let validators: string | undefined;
        switch (name) {
            case 'eventName':
                validators = Validators.required(value) || Validators.maxLength(value, maxValues.maxTitle);
                break;
            case 'eventDescription':
                validators = Validators.required(value) || Validators.maxLength(value, maxValues.maxDescription);
                break;
            case 'selectedTheme':
                validators = Validators.required(value);
                break;
            case 'eventDate':
                validators = Validators.required(value) || Validators.minDate(new Date(value), new Date());
                break;
            case 'eventTime':
                validators = Validators.required(value);
                break;
        }
        this.setState({
            errors: { ...this.state.errors, [name]: validators }
        })
    }

    getLatitude = () => {
        const { userPosition, lastLocation } = this.props;
        return userPosition?.lat ?? lastLocation?.latitude;
    }

    getLongitude = () => {
        const { userPosition, lastLocation } = this.props;
        return userPosition?.long ?? lastLocation?.longitude;
    }

    renderThemesSelect() {
        const themes = ALL_THEMES;
        if (themes) {
            return themes
                .map((item, key) => {
                    return <option
                        key={key}
                        value={item.id}>
                        {item.name}
                    </option>
                });
        }
    }

    isValid() {
        let errors = {};
        let formIsValid = true;
        const { eventForm } = this.props;
        if (!eventForm.eventName || eventForm.eventName.length === 0) {
            formIsValid = false;
            errors['eventName'] = "Обязательное поле";
        } else if (eventForm.eventName.length > maxValues.maxTitle) {
            formIsValid = false;
            errors['eventName'] = `Максимум ${maxValues.maxTitle} символа`;
        }

        if (!eventForm.eventDescription) {
            formIsValid = false;
            errors['eventDescription'] = "Обязательное поле";
        } else if (eventForm.eventName.length > maxValues.maxDescription) {
            formIsValid = false;
            errors['eventDescription'] = `Максимум ${maxValues.maxDescription} символа`;
        }

        if (!eventForm.selectedTheme) {
            formIsValid = false;
            errors['selectedTheme'] = "Обязательное поле";
        }

        if (!eventForm.eventDate) {
            formIsValid = false;
            errors['eventDate'] = "Обязательное поле";
        } else {
            const currentDate = new Date();
            const min = -currentDate.getTimezoneOffset();
            currentDate.setHours(0, min, 0, 0);
            const selectedDate = new Date(eventForm.eventDate);
            if (selectedDate < currentDate) {
                formIsValid = false;
                errors['eventDate'] = "Нельзя выбрать прошедшие даты";
            }
        }

        if (!eventForm.eventTime) {
            formIsValid = false;
            errors['eventTime'] = "Обязательное поле";
        } else {
            const currentDate = new Date();
            const selectedDate = new Date(`${eventForm.eventDate} ${eventForm.eventTime}`);
            if (selectedDate < currentDate) {
                formIsValid = false;
                errors['eventTime'] = "Нельзя выбрать прошедшее время";
            }
        }

        if (!eventForm.selectedPosition?.lat) {
            formIsValid = false;
            errors['selectedPosition'] = "Обязательное поле";
        }

        this.setState({ errors: errors });
        return formIsValid;
    }

    onLocationChanged = (location: Position, address: string) => {
        const { updateEventForm } = this.props;
        if (location) {
            updateEventForm({ name: "selectedPosition", value: { lng: location.longitude, lat: location.latitude } });
            updateEventForm({ name: "address", value: address });
            this.setState({
                errors: { ...this.state.errors, selectedPosition: undefined }
            });
        }
    }

    render() {
        const { errors } = this.state;
        const { isOnline, eventForm } = this.props;
        return (
            <FormLayout>
                <Input
                    maxLength={maxValues.maxTitle}
                    top={<span className="flex-between">Название <span>{maxValues.maxTitle - eventForm.eventName.length}</span></span>}
                    type="text"
                    placeholder="Введите текст"
                    name="eventName"
                    value={eventForm.eventName}
                    onChange={this.handleInputChange}
                    status={errors.eventName ? 'error' : 'default'}
                    bottom={errors.eventName}
                />
                <Textarea
                    minLength={1}
                    maxLength={maxValues.maxDescription}
                    top={<span className="flex-between">Описание <span>{maxValues.maxDescription - eventForm.eventDescription.length}</span></span>}
                    placeholder="Введите текст"
                    value={eventForm.eventDescription}
                    name="eventDescription"
                    onChange={this.handleInputChange}
                    status={errors.eventDescription ? 'error' : 'default'}
                    bottom={errors.eventDescription}
                ></Textarea>
                <Select
                    status={errors.selectedTheme ? 'error' : 'default'}
                    bottom={errors.selectedTheme} placeholder="Выберите тему"
                    value={eventForm.selectedTheme}
                    name="selectedTheme" onChange={this.handleInputChange}>
                    {this.renderThemesSelect()}
                </Select>
                <Input
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(9999, 11).toISOString().split('T')[0]}
                    status={errors.eventDate ? 'error' : 'default'}
                    value={eventForm.eventDate}
                    top="Дата встречи"
                    type="date"
                    name="eventDate"
                    bottom={errors.eventDate}
                    onChange={this.handleInputChange} />
                <Input
                    status={errors.eventTime ? 'error' : 'default'}
                    bottom={errors.eventTime}
                    value={eventForm.eventTime}
                    top="Время встречи"
                    type="time"
                    name="eventTime"
                    onChange={this.handleInputChange} required />
                <AutocompleteMap
                    isOnline={isOnline}
                    top="Место встречи"
                    placeholder="Адрес"
                    type="address"
                    loadMaps={true}
                    address={eventForm.address}
                    onLocationChanged={this.onLocationChanged}></AutocompleteMap>
                <div className="map">
                    <GoogleMapReact
                        yesIWantToUseGoogleMapApiInternals={true}
                        bootstrapURLKeys={{ key: MAP.KEY }}
                        center={{
                            lat: eventForm.selectedPosition?.lat ?? this.getLatitude(),
                            lng: eventForm.selectedPosition?.lng ?? this.getLongitude()
                        }}
                        defaultZoom={eventForm.zoom}
                        defaultCenter={{
                            lat: this.getLatitude(), lng: this.getLongitude()
                        }}
                        onClick={this.onLocationClick}
                        distanceToMouse={(pt, m) => 0}
                    >
                        {eventForm.selectedPosition?.lat && <Marker lat={eventForm.selectedPosition?.lat} lng={eventForm.selectedPosition?.lng} />}
                    </GoogleMapReact>
                </div>
                {errors.selectedPosition && <FormStatus header="Выберите место встречи" mode="error">
                    Выберите место на карте или найдите место по адресу
                </FormStatus>}
                <Button className="btn-primary" size="xl" onClick={this.onFillInProfile}>Создать</Button>
            </FormLayout>
        )
    }
}


const mapStateToProps = ({ authentication, ui, events }: AppState, ownProps: OwnProps) => ({
    userPosition: authentication.geoData,
    vkUserInfo: authentication.vkUserInfo,
    lastLocation: authentication.currentUser?.lastLocation,
    isOnline: ui.settings.isOnline,
    eventForm: events.myEvents.eventForm,
    onSave: ownProps.onSave,
})

const mapDispatchToProps: PropsFromDispatch = {
    updateEventForm: updateEventForm
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EventForm);
