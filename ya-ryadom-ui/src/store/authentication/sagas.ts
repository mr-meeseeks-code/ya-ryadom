import { all, call, fork, put, takeEvery, takeLatest, select, take } from 'redux-saga/effects';
import vkBridge, { UserInfo } from '@vkontakte/vk-bridge';
import { AuthenticationTypes } from './types';
import {
    fetchUserInfoError,
    fetchUserInfoSuccess,
    fetchUserInfoRequest,
    saveUserInfoRequest,
    saveUserInfoSuccess,
    saveUserInfoError,
    fetchVkUserInfoRequest,
    fetchVkUserInfoError,
    fetchVkUserInfoSuccess,
    fetchUserGeoError,
    fetchUserGeoSuccess,
    saveUserThemesRequest,
    saveUserThemesError,
    saveUserThemesSuccess,
    saveUserLocationRequest,
    saveUserLocationError,
    saveUserLocationSuccess,
    saveUserAboutMyselfRequest,
    saveUserAboutMyselfError,
    saveUserAboutMyselfSuccess,
    allowNotificationsRequest,
    allowNotificationsError,
    allowNotificationsSuccess,
    disableNotificationsRequest,
    disableNotificationsError,
    disableNotificationsSuccess,
    saveUserProfileThemes,
    saveUserProfileAboutMyself,
    completeUserGuide,
    setUserAboutMyself,
    enableUserGeolocation,
    setUserGeolocation,
    fetchUserGeoRequest,
    clearUserGeo
} from './actions'
import { callApi } from '../../utils/api';
import { Geo, CurrentUser, SaveUserInfoRequest, Position } from './models';
import { goForward, reset, goBack } from '../history/actions';
import { VkHistoryModel } from '../history/models';
import { VIEWS } from '../../utils/constants/view.constants';
import { PANELS } from '../../utils/constants/panel.constants';
import { getVkUserId, getGeoData, getVkUserInfo, getCurrentUser } from './reducer';
import { showSpinner, hideSpinner } from '../ui/spinner/actions';
import { TABS } from '../../utils/constants/tab.constants';

const API_ENDPOINT: any = `${process.env.REACT_APP_API_ENDPOINT}/auth`;

function* handleFetchUserInfo(action: ReturnType<typeof fetchUserInfoRequest>) {
    try {
        yield put(showSpinner());
        const model = {
            vkUserId: action.payload,
        };
        const result = yield call(callApi, 'post', API_ENDPOINT, `/my-info`, model);

        if (result.errors) {
            yield put(fetchUserInfoError(result.errors));
        } else {
            const currentUser: CurrentUser = yield put(select(getCurrentUser));
            var user: CurrentUser = result || currentUser || new CurrentUser();
            yield put(fetchUserInfoSuccess(user));
            if (user.guideCompleted) {
                yield put(reset(new VkHistoryModel(VIEWS.EVENTS_NEAR_ME_VIEW, PANELS.EVENTS_NEAR_ME_PANEL, TABS.EVENTS_MAP)));
            }
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(fetchUserInfoError(error.stack));
        } else {
            yield put(fetchUserInfoError('An unknown error occured.'));
        }
    } finally {
        yield put(hideSpinner());
    }
}

function* watchFetchUserInfoRequest() {
    yield takeEvery(AuthenticationTypes.FETCH_USER_INFO, handleFetchUserInfo)
}

function* handleFetchVkUserInfo(action: ReturnType<typeof fetchVkUserInfoRequest>) {
    try {
        // Work only via vk tunnel
        const result = yield vkBridge.send('VKWebAppGetUserInfo', {});

        if (result.error_type) {
            yield put(fetchVkUserInfoError(result.errors));
        } else {
            const vkUserInfo = result as UserInfo;
            yield put(fetchVkUserInfoSuccess(vkUserInfo));
            yield put(fetchUserInfoRequest(vkUserInfo.id));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(fetchVkUserInfoError(error.stack));
        } else {
            yield put(fetchVkUserInfoError('An unknown error occured.'));
        }
    }
}

function* watchFetchVkUserInfoRequest() {
    yield takeEvery(AuthenticationTypes.FETCH_VK_USER_INFO, handleFetchVkUserInfo)
}

function* handleFetchUserGeo() {
    try {
        // Work only via vk tunnel
        const result = yield vkBridge.send("VKWebAppGetGeodata", {});

        if (result.error_type) {
            yield put(fetchUserGeoError(result.errors));
        } else {
            const geoData = result as Geo;
            yield put(fetchUserGeoSuccess(geoData));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(fetchVkUserInfoError(error.stack));
        } else {
            yield put(fetchVkUserInfoError('An unknown error occured.'));
        }
    }
}

function* watchFetchUserGeoRequest() {
    yield takeEvery(AuthenticationTypes.FETCH_USER_GEO, handleFetchUserGeo)
}

function* handleSaveUserInfoRequest(action: ReturnType<typeof saveUserInfoRequest>) {
    try {
        const result = yield call(callApi, 'post', API_ENDPOINT, '/user-info/save', action.payload);

        if (result.errors) {
            yield put(saveUserInfoError(result.errors));
        } else {
            yield put(saveUserInfoSuccess(result));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(saveUserInfoError(error.stack));
        } else {
            yield put(saveUserInfoError('An unknown error occured.'));
        }
    } finally {

    }
}

function* watchSaveUserInfoRequest() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_INFO, handleSaveUserInfoRequest)
}

function* handleSaveUserProfileThemes(action: ReturnType<typeof saveUserProfileThemes>) {
    yield put(saveUserThemesRequest(action.payload));
    yield take(AuthenticationTypes.SAVE_USER_THEMES_SUCCESS);
    yield put(goBack());
}

function* watchSaveUserProfileThemes() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_PROFILE_THEMES, handleSaveUserProfileThemes)
}

function* handleSaveUserThemesRequest(action: ReturnType<typeof saveUserThemesRequest>) {
    try {
        yield put(showSpinner());
        const vkUserId = yield select(getVkUserId);

        const userIntro = {
            vkUserId: vkUserId,
            selectedThemes: action.payload
        };

        const result = yield call(callApi, 'post', API_ENDPOINT, '/user-info/themes/save', userIntro);

        if (result.errors) {
            yield put(saveUserThemesError(result.errors));
        } else {
            yield put(saveUserThemesSuccess(action.payload));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(saveUserThemesError(error.stack));
        } else {
            yield put(saveUserThemesError('An unknown error occured.'));
        }
    } finally {
        yield put(hideSpinner());
    }
}

function* watchSaveUserThemesRequest() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_THEMES, handleSaveUserThemesRequest)
}

function* handleSaveUserLocationRequest(action: ReturnType<typeof saveUserLocationRequest>) {
    try {
        const vkUserId = yield select(getVkUserId);

        const userLocation = {
            vkUserId: vkUserId,
            geolocationEnabled: action.payload.geolocationEnabled,
            latitude: action.payload.location?.latitude,
            longitude: action.payload.location?.longitude
        };

        const result = yield call(callApi, 'post', API_ENDPOINT, '/user-info/location/save', userLocation);

        if (result.errors) {
            yield put(saveUserLocationError(result.errors));
        } else {
            yield put(saveUserLocationSuccess(action.payload.location));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(saveUserLocationError(error.stack));
        } else {
            yield put(saveUserLocationError('An unknown error occured.'));
        }
    } finally {

    }
}

function* watchSaveUserLocationRequest() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_LOCATION, handleSaveUserLocationRequest)
}

function* handleSaveUserProfileAboutMyself(action: ReturnType<typeof saveUserProfileAboutMyself>) {
    yield put(saveUserAboutMyselfRequest(action.payload));
    yield take(AuthenticationTypes.SAVE_USER_ABOUT_MYSELF_SUCCESS);
    yield put(goBack());
}

function* watchSaveUserProfileAboutMyself() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_PROFILE_ABOUT_MYSELF, handleSaveUserProfileAboutMyself)
}

function* handleSaveUserAboutMyselfRequest(action: ReturnType<typeof saveUserAboutMyselfRequest>) {
    try {
        yield put(showSpinner());
        const vkUserId = yield select(getVkUserId);

        const userAboutMySelf = {
            vkUserId: vkUserId,
            aboutMyself: action.payload,
        };

        const result = yield call(callApi, 'post', API_ENDPOINT, '/user-info/about-myself/save', userAboutMySelf);

        if (result.errors) {
            yield put(saveUserAboutMyselfError(result.errors));
        } else {
            yield put(saveUserAboutMyselfSuccess(action.payload));
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(saveUserAboutMyselfError(error.stack));
        } else {
            yield put(saveUserAboutMyselfError('An unknown error occured.'));
        }
    } finally {
        yield put(hideSpinner());
    }
}

function* watchSaveUserAboutMyselfRequest() {
    yield takeLatest(AuthenticationTypes.SAVE_USER_ABOUT_MYSELF, handleSaveUserAboutMyselfRequest)
}

function* handleAllowNotificationsRequest(action: ReturnType<typeof allowNotificationsRequest>) {
    try {
        yield put(showSpinner());

        const result = yield vkBridge.send("VKWebAppAllowNotifications", {});
        let notificationSaved = false;
        if (result) {
            const vkUserId = yield select(getVkUserId);
            const model = {
                vkUserId: vkUserId,
                notificationsEnabled: true,
            };
            notificationSaved = yield call(callApi, 'post', API_ENDPOINT, '/user-info/notifications/save', model);
        }
        if (!result || !notificationSaved || result.error_type) {
            yield put(allowNotificationsError(result?.errors));
        } else {
            yield put(allowNotificationsSuccess());
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(allowNotificationsError(error.stack));
        } else {
            yield put(allowNotificationsError('An unknown error occured.'));
        }
    } finally {
        yield put(hideSpinner());
    }
}

function* watchAllowNotificationsRequest() {
    yield takeLatest(AuthenticationTypes.ALLOW_NOTIFICATIONS, handleAllowNotificationsRequest)
}

function* handleDisableNotificationsRequest(action: ReturnType<typeof disableNotificationsRequest>) {
    try {
        yield put(showSpinner());

        const result = yield vkBridge.send("VKWebAppDenyNotifications", {});
        let notificationSaved = false;
        if (result) {
            const vkUserId = yield select(getVkUserId);
            const model = {
                vkUserId: vkUserId,
                notificationsEnabled: false,
            };
            notificationSaved = yield call(callApi, 'post', API_ENDPOINT, '/user-info/notifications/save', model);
        }
        if (!result || !notificationSaved || result.error_type) {
            yield put(disableNotificationsError(result.errors));
        } else {
            yield put(disableNotificationsSuccess());
        }
    } catch (error) {
        if (error instanceof Error && error.stack) {
            yield put(disableNotificationsError(error.stack));
        } else {
            yield put(disableNotificationsError('An unknown error occured.'));
        }
    } finally {
        yield put(hideSpinner());
    }
}

function* watchDisableNotificationsRequest() {
    yield takeLatest(AuthenticationTypes.DISABLE_NOTIFICATIONS, handleDisableNotificationsRequest)
}

function* handleCompleteUserGuide(action: ReturnType<typeof completeUserGuide>) {
    yield put(showSpinner());

    yield put(setUserAboutMyself(action.payload));

    const vkUserInfo: UserInfo = yield select(getVkUserInfo);
    const currentUser: CurrentUser = yield select(getCurrentUser);
    const geoData: Geo = yield select(getGeoData);
    let position: Position | undefined;
    if (geoData?.available) {
        position = { latitude: geoData.lat, longitude: geoData.long };
    }
    var model = SaveUserInfoRequest.fromVkAndCurrentUser(vkUserInfo, currentUser, position);
    yield put(saveUserInfoRequest(model));
    yield take(AuthenticationTypes.SAVE_USER_INFO_SUCCESS);

    yield put(goForward(new VkHistoryModel(VIEWS.INTRO_VIEW, PANELS.COMPLETED_INTRO_PANEL)));

    yield put(hideSpinner());
}

function* watchCompleteUserGuide() {
    yield takeLatest(AuthenticationTypes.COMPLETE_USER_GUIDE, handleCompleteUserGuide)
}

function* handleEnableUserGeolocation() {
    yield put(fetchUserGeoRequest());
    yield take(AuthenticationTypes.FETCH_USER_GEO_SUCCESS);
    const currentUser: CurrentUser = yield put(select(getCurrentUser));
    const geoData: Geo | null = yield put(select(getGeoData));
    const location = geoData
        ? { latitude: geoData.lat, longitude: geoData.long }
        : currentUser.lastLocation;
    const model = { geolocationEnabled: true, location: location };
    yield put(saveUserLocationRequest(model));
    yield take(AuthenticationTypes.SAVE_USER_LOCATION_SUCCESS);
    yield put(setUserGeolocation(true));
}

function* watchEnableUserGeolocation() {
    yield takeLatest(AuthenticationTypes.ENABLE_USER_LOCATION, handleEnableUserGeolocation)
}

function* handleDisableUserGeolocation() {   
    const model = { geolocationEnabled: false, location: null };
    yield put(saveUserLocationRequest(model));
    yield take(AuthenticationTypes.SAVE_USER_LOCATION_SUCCESS);
    yield put(setUserGeolocation(false));
    yield put(clearUserGeo());
}

function* watchDisableUserGeolocation() {
    yield takeLatest(AuthenticationTypes.DISABLE_USER_LOCATION, handleDisableUserGeolocation)
}

function* authenticationSagas() {
    yield all([
        fork(watchFetchUserInfoRequest),
        fork(watchFetchVkUserInfoRequest),
        fork(watchSaveUserInfoRequest),
        fork(watchFetchUserGeoRequest),
        fork(watchSaveUserThemesRequest),
        fork(watchSaveUserLocationRequest),
        fork(watchSaveUserAboutMyselfRequest),
        fork(watchAllowNotificationsRequest),
        fork(watchDisableNotificationsRequest),
        fork(watchSaveUserProfileThemes),
        fork(watchSaveUserProfileAboutMyself),
        fork(watchCompleteUserGuide),
        fork(watchEnableUserGeolocation),
        fork(watchDisableUserGeolocation),
    ])
}

export default authenticationSagas;
