import './events-near-me.panel.scss';
import React from 'react';
import {
    Panel, IS_PLATFORM_ANDROID, Group
} from '@vkontakte/vkui';
import { AppState } from '../../../store/app-state';
import { connect } from 'react-redux';
import MainHeaderPanel from '../headers/main.header';
import EventsTabs from '../../tabs/events.tabs';
import EventsNearMeListTabPage from '../../tab-pages/events-near-me-list.tab-page';
import EventsNearMeMapTabPage from '../../tab-pages/events-near-me-map.tab-page';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon28Filter from '@vkontakte/icons/dist/28/sliders_outline';
import { TABS } from '../../../utils/constants/tab.constants';

interface OwnProps {
    id: string;
    openFilter: () => void;
    openComplaintForm: (eventId: number) => void;
}

interface PropsFromState {
    activeTab: string | undefined;
}

interface PropsFromDispatch {
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

interface State {

}

class EventsNearMePanel extends React.Component<AllProps, State>  {
    render() {
        const { id, activeTab, openFilter, openComplaintForm } = this.props;

        return (
            <Panel id={id} className="events-near-me-panel">
                <MainHeaderPanel leftButton={
                    IS_PLATFORM_ANDROID
                        ? <Icon24Filter className="nav-icon-selected filter" onClick={openFilter} />
                        : <Icon28Filter className="nav-icon-selected filter" onClick={openFilter} />
                } text={"События"} />
                <Group separator="show">
                    <EventsTabs></EventsTabs>
                </Group>
                {activeTab === TABS.EVENTS_LIST && <EventsNearMeListTabPage openComplaintForm={openComplaintForm} id={TABS.EVENTS_LIST} />}
                {activeTab === TABS.EVENTS_MAP && <EventsNearMeMapTabPage openComplaintForm={openComplaintForm} id={TABS.EVENTS_MAP} />}

            </Panel >
        )
    }
}

const mapStateToProps = ({ history }: AppState, ownProps: OwnProps) => ({
    activeTab: history.currentViewPanel.tab,
    id: ownProps.id,
    openFilter: ownProps.openFilter,
    openComplaintForm: ownProps.openComplaintForm
})

const mapDispatchToProps: PropsFromDispatch = {
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EventsNearMePanel);
