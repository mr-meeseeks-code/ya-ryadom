import React from 'react';
import { View } from '@vkontakte/vkui';
import { PANELS } from '../../utils/constants/panel.constants';
import { AppState } from '../../store/app-state';
import { connect } from 'react-redux';
import HelloIntroPanel from '../panels/intro/hello-intro.panel';
import ThemesIntroPanel from '../panels/intro/themes-intro.panel';
import SelectCityIntroPanel from '../panels/intro/select-city-intro.panel';
import AboutMyselfIntroPanel from '../panels/intro/about-myself-intro.panel';
import CompletedIntroPanel from '../panels/intro/completed-intro.panel';
import GeolocationIntroPanel from '../panels/intro/geolocation-intro.panel';

interface PropsFromState {
	id: string;
	activePanel: string;
}

interface PropsFromDispatch {}

type AllProps = PropsFromState & PropsFromDispatch;

class IntroView extends React.Component<AllProps> {
	render() {
		let { id, activePanel } = this.props;

		return (
			<View id={id} activePanel={activePanel}>
				<HelloIntroPanel id={PANELS.HELLO_INTRO_PANEL}></HelloIntroPanel>
				<GeolocationIntroPanel
					id={PANELS.GEOLOCATION_INTRO_PANEL}
				></GeolocationIntroPanel>
				<ThemesIntroPanel id={PANELS.THEMES_INTRO_PANEL}></ThemesIntroPanel>
				<SelectCityIntroPanel
					id={PANELS.SELECT_CITY_INTRO_PANEL}
				></SelectCityIntroPanel>
				<AboutMyselfIntroPanel
					id={PANELS.ABOUT_MYSELF_INTRO_PANEL}
				></AboutMyselfIntroPanel>
				<CompletedIntroPanel
					id={PANELS.COMPLETED_INTRO_PANEL}
				></CompletedIntroPanel>
			</View>
		);
	}
}

const mapStateToProps = ({ history }: AppState) => ({
	activePanel: history.currentViewPanel.panel,
});

const mapDispatchToProps: PropsFromDispatch = {};

export default connect(mapStateToProps, mapDispatchToProps)(IntroView);
