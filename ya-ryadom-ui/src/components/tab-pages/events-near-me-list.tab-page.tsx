import React from 'react';
import { Group, RichCell, Button, Avatar, Div, Header } from '@vkontakte/vkui';
import { AppState } from '../../store/app-state';
import { connect } from 'react-redux';
import { fetchListRequest } from '../../store/events/events-near-me/actions';
import { EventNearMe } from '../../store/events/events-near-me/models';
import { Geo } from '../../store/authentication/models';
import { applyToEventFromEvents } from '../../store/applications/actions';
import { Position } from '../../store/authentication/models';
import { UserInfo } from '@vkontakte/vk-bridge';
import { ApplicationStatus } from '../../utils/enums/application-status.enum';
import { ALL_THEMES } from '../../utils/constants/theme.constants';
import { dateOptions } from '../../utils/constants/event-date-options.constant';
import { goForward, openUserProfile } from "./../../store/history/actions";
import { VkHistoryModel } from '../../store/history/models';
import { VIEWS } from '../../utils/constants/view.constants';
import { PANELS } from '../../utils/constants/panel.constants';
import EmptyText from '../general/empty-text';
import { ApplicationStatusString } from '../../utils/constants/application-status-string.constant';

interface PropsFromState {
    id: string;
    eventsList: EventNearMe[];
    userPosition: Geo;
    lastLocation: Position;
    vkUserInfo: UserInfo;
}

interface PropsFromDispatch {
    fetchList: typeof fetchListRequest,
    applyToEvent: typeof applyToEventFromEvents,
    openUserProfile: typeof openUserProfile
}

type AllProps = PropsFromState & PropsFromDispatch;

interface State {
}

class EventsNearMeListTabPage extends React.Component<AllProps, State>  {

    apply(eventId: number) {
        const { applyToEvent } = this.props;
        applyToEvent(eventId);
    }

    private renderEvents() {
        const { eventsList, openUserProfile } = this.props;
        if (eventsList) {
            return eventsList
                .map((item, key) => {
                    return <div key={key}>
                        <Group separator="show" header={<Header mode="secondary">{ALL_THEMES.find(m => m.id === item.themeType)?.name}</Header>}>
                            <RichCell
                                disabled
                                multiline
                                before={<Avatar onClick={() => openUserProfile(item.vkUserOwnerId)} size={48} src={item.vkUserAvatarUrl} />}
                                text={item?.description}
                                caption={`${new Date(item.date).toLocaleDateString('ru-RU', dateOptions)} в ${item.time}`}
                            >
                                <span>{item?.userFullName} <span className="distance">{item?.distance && (item?.distance / 1000).toFixed(2)} км.</span></span>
                            </RichCell>
                            <Div className="map-card-buttons-div">
                                {item.applicationStatus === ApplicationStatus.none
                                    ? <Button className="button-primary" onClick={() => this.apply(item.id)}>Иду</Button>
                                    : <Button className="button-primary btn-status disabled" disabled={true}>{ApplicationStatusString[item.applicationStatus]}</Button>}
                                <Button className="btn-secondary width-50 text-center"
                                    onClick={() => openUserProfile(item.vkUserOwnerId)}
                                >Профиль</Button>
                            </Div>
                        </Group>
                    </div>
                });
        }
    }

    render() {
        const { eventsList } = this.props;
        return (
            <Group separator="hide">
                {eventsList?.length > 0 ? this.renderEvents() : <EmptyText text="События не найдены" />}
            </Group>
        )
    }
}

const mapStateToProps = ({ events, authentication }: AppState) => ({
    eventsList: events.eventsNearMe.eventsList,
    userPosition: authentication.geoData,
    lastLocation: authentication.currentUser?.lastLocation,
    vkUserInfo: authentication.vkUserInfo,
})

const mapDispatchToProps: PropsFromDispatch = {
    fetchList: fetchListRequest,
    applyToEvent: applyToEventFromEvents,
    openUserProfile: openUserProfile
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EventsNearMeListTabPage);