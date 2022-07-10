import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {
    AdaptivityProvider,
    AppRoot,
    Avatar,
    Button,
    Checkbox,
    ConfigProvider,
    Div,
    Epic,
    File,
    FormItem,
    Gradient,
    Group,
    Input,
    NativeSelect,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Placeholder,
    Root,
    ScreenSpinner,
    Tabbar,
    TabbarItem,
    Textarea,
    Title,
    View,
    withAdaptivity
} from "@vkontakte/vkui";
import {
    Icon28Newsfeed,
    Icon28NewsfeedOutline,
    Icon28ServicesOutline,
    Icon28SettingsOutline,
    Icon28UploadOutline,
    Icon56CameraOffOutline,
    Icon56ComputerOutline,
    Icon56HideOutline,
    Icon56MessagesOutline,
    Icon56PaletteOutline,
    Icon56Users3Outline
} from "@vkontakte/icons";
import "@vkontakte/vkui/dist/vkui.css";
import {Paintable} from "paintablejs/react";
import {BACKEND} from "./config";
import axios from "axios";
import bridge from "@vkontakte/vk-bridge";
import * as queryString from "query-string";
import {AutographCard} from "./components/AutographCard";

const App = withAdaptivity(
    ({viewWidth}) => {
        const [activeStory, setActiveStory] = React.useState("leave");
        const [activeView, setActiveView] = React.useState("epic");
        const [activePanel, setActivePanel] = React.useState("epic");
        const onStoryChange = (e) => setActiveStory(e.currentTarget.dataset.story);
        const [name, setName] = useState("")
        const [isAnon, setIsAnon] = useState(false)
        const [image, setImage] = useState("")
        const [text, setText] = useState("")
        const paintableRef = useRef(null);
        const [color, setColor] = useState('#0000FF');
        const [active, setActive] = useState(true);
        const [thickness, setThickness] = useState(5);
        const [useEraser, setUseEraser] = useState(false);
        const [popout, setPopout] = useState(null)
        const [currentUser, setCurrentUser] = useState(null)
        const [launchedFrom, setLaunchedFrom] = useState(null)
        const [myAutographs, setMyAutographs] = useState([])
        const [usersAutographs, setUsersAutographs] = useState([])
        const [user, setUser] = useState(null)
        const [settingsLeave, setSettingsLeave] = useState("all")
        const [settingsView, setSettingsView] = useState("all")
        const [deniedView, setDeniedView] = useState(false)
        const [canAdd, setCanAdd] = useState(false)

        useEffect(() => {
            bridge.send("VKWebAppInit");

            bridge.send("VKWebAppGetUserInfo").then(r => {
                setCurrentUser(r)
                loadAutographs(r.id, true)
                loadSettings(r.id)

                const launchParams = window.location.search.slice(1);
                const launchParamsObj = queryString.parse(launchParams)
                // launchParamsObj.vk_profile_id = "1"

                setLaunchedFrom(launchParamsObj.vk_profile_id)
                getCanAdd(launchParamsObj.vk_profile_id)

                if (!launchParamsObj.vk_profile_id) {
                    setActiveStory("my_autographs")
                    loadUser(launchParamsObj.vk_profile_id)
                    loadAutographs(launchParamsObj.vk_profile_id, false)
                }

                if (!launchParamsObj.vk_has_profile_button) {
                    addToProfile()
                }
            })

        }, [])

        useEffect(() => {
            loadAutographs(launchedFrom, false)
            loadSettings()
            loadAutographs(currentUser?.id, true)
        }, [activeStory, activePanel])

        const addToProfile = () => {
            bridge.send("VKWebAppAddToProfile", {ttl: 0})
        }

        const getCanAdd = (id) => {
            axios.get(BACKEND + "canAddAutograph/" + id).then(r => {
                setCanAdd(r.data.canAdd)
            })
        }

        const loadUser = async (fromId) => {
            const token = (await bridge.send("VKWebAppGetAuthToken", {
                "app_id": 8213399,
                "scope": ""
            })).access_token
            const user = (await bridge.send("VKWebAppCallAPIMethod",
                {
                    "method": "users.get",
                    "request_id": "123432123",
                    "params": {"user_ids": fromId, "v": "5.131", "access_token": token, "fields": "photo_200"}
                })).response[0]
            setUser(user)
        }


        const showSpinner = () => {
            setPopout(<ScreenSpinner/>)
        }

        const hideSpinner = () => {
            setPopout(null)
        }

        const onSaveGraffiti = (image) => {
            setImage(image)
            addAutograph("graffiti", image).then(r => {
                paintableRef.current?.clear()
                setActive(true)
                setActiveView("epic")
            })
        }

        const onSaveText = () => {
            showSpinner()
            addAutograph("text").then(r => {
                clearData()
            })
        }

        const onSavePicture = () => {
            showSpinner()
            addAutograph("picture").then(r => {
                clearData()
            })
        }

        const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const onUploadPicture = (e) => {
            showSpinner()
            toBase64(e.target.files[0]).then(r => {
                setImage(r)
                hideSpinner()
            })
        }

        const addAutograph = (type, passImage = null) => {
            return axios.post(BACKEND + "addAutograph", {
                from: currentUser.id,
                to: launchedFrom,
                text: text,
                image: passImage || image,
                displayName: name,
                isAnon: isAnon,
                type: type
            })
        }

        const clearData = () => {
            setName("")
            setImage("")
            setIsAnon(false)
            setActiveView("epic")
            hideSpinner()
        }

        const loadAutographs = (id = null, own = false) => {
            showSpinner()
            axios.get(BACKEND + "getAutographsTo/" + id || currentUser?.id, {headers: {own: own}}).then(r => {
                if (r.data?.denied === true) {
                    setDeniedView(true)
                } else {
                    if (own) {
                        setMyAutographs(r.data)
                    } else {
                        setUsersAutographs(r.data)
                    }
                }

                hideSpinner()
            })
        }

        useEffect(() => {
            if (isAnon) {
                setName("Аноним")
            } else {
                setName(currentUser?.first_name + " " + currentUser?.last_name)
            }
        }, [isAnon, currentUser])

        useEffect(() => {
            loadAutographs(currentUser?.id, true)
        }, [currentUser])

        const shareApp = () => {
            bridge.send("VKWebAppShare", {link: "https://vk.com/app8213399"})
        }

        const onSettingsUpdate = (type, e) => {
            showSpinner()
            axios.post(BACKEND + "setSettings", {[type]: e, id: currentUser?.id}).then((r) => {
                loadSettings(currentUser?.id)
            })
        }

        const loadSettings = (id = null) => {
            showSpinner()
            axios.post(BACKEND + "getSettings", {id: id || currentUser?.id}).then(r => {
                setSettingsLeave(r.data?.leave)
                setSettingsView(r.data?.view)
                hideSpinner()
            })
        }

        return (
            <AppRoot>
                <Root activeView={activeView} popout={popout}>
                    <View activePanel="epic" id="epic">
                        <Panel id="epic">
                            <Epic
                                activeStory={activeStory}
                                tabbar={
                                    <Tabbar>
                                        <TabbarItem
                                            onClick={onStoryChange}
                                            selected={activeStory === "my_autographs"}
                                            data-story="my_autographs"
                                            text="Мои автографы"
                                        >
                                            <Icon28NewsfeedOutline/>
                                        </TabbarItem>
                                        {
                                            !!launchedFrom &&
                                            <TabbarItem
                                                onClick={onStoryChange}
                                                selected={activeStory === "leave"}
                                                data-story="leave"
                                                text="Оставить автограф"
                                            >
                                                <Icon28ServicesOutline/>
                                            </TabbarItem>
                                        }
                                        {
                                            !!launchedFrom &&
                                            <TabbarItem
                                                onClick={onStoryChange}
                                                selected={activeStory === "autographs"}
                                                data-story="autographs"
                                                text="Автографы"
                                            >
                                                <Icon28Newsfeed/>
                                            </TabbarItem>
                                        }
                                        <TabbarItem
                                            onClick={onStoryChange}
                                            selected={activeStory === "settings"}
                                            data-story="settings"
                                            text="Настройки"
                                        >
                                            <Icon28SettingsOutline/>
                                        </TabbarItem>
                                    </Tabbar>
                                }
                            >
                                <View id="my_autographs" activePanel="my_autographs">
                                    <Panel id="my_autographs">
                                        <PanelHeader>Мои автографы</PanelHeader>

                                        <Div>
                                            {
                                                myAutographs.length ?
                                                    myAutographs.map(a => {
                                                        return (
                                                            <AutographCard fromId={a?.from}
                                                                           text={a?.text}
                                                                           type={a?.type}
                                                                           image={a?.image}
                                                                           isAnon={a?.isAnon}
                                                                           name={a?.displayName}
                                                                           date={a?.date}
                                                                           stories
                                                            />
                                                        )
                                                    })
                                                    :
                                                    <Placeholder icon={<Icon56Users3Outline/>}
                                                                 header="Ничего не нашлось" action={<Button
                                                        onClick={shareApp}>Поделиться</Button>}>
                                                        Скорее собирайте автографы! Попросите у друзей расписаться на
                                                        вашей странице!
                                                    </Placeholder>
                                            }
                                        </Div>
                                    </Panel>
                                </View>
                                <View id="leave" activePanel="leave">
                                    <Panel id="leave">
                                        <PanelHeader>Оставить автограф</PanelHeader>
                                        <Div>
                                            {
                                                (currentUser?.id + "") === (launchedFrom + "") ?
                                                    <Placeholder icon={<Icon56HideOutline/>}
                                                                 header="Нельзя оставить автограф самому себе!"/> :
                                                    canAdd ?
                                                        <Group>
                                                            <Button
                                                                size="l"
                                                                stretched
                                                                before={<Icon56MessagesOutline/>}
                                                                onClick={() => {
                                                                    setActiveView("addAutograph");
                                                                    setActivePanel("addText")
                                                                }}
                                                            >
                                                                <span>Добавить тектовый автограф</span>
                                                            </Button>

                                                            <Button
                                                                size="l"
                                                                stretched
                                                                style={{marginTop: "12px"}}
                                                                before={<Icon56ComputerOutline/>}
                                                                onClick={() => {
                                                                    setActiveView("addAutograph");
                                                                    setActivePanel("addPhoto")
                                                                }}

                                                            >
                                                                <span>Добавить автограф-картинку</span>
                                                            </Button>

                                                            <Button
                                                                size="l"
                                                                stretched
                                                                style={{marginTop: "12px"}}
                                                                before={<Icon56PaletteOutline/>}
                                                                onClick={() => {
                                                                    setActiveView("addAutograph");
                                                                    setActivePanel("addPaint")
                                                                }}
                                                            >
                                                                <span>Добавить автограф-граффити</span>
                                                            </Button>
                                                        </Group>
                                                        :
                                                        <Placeholder
                                                            icon={<Icon56HideOutline/>}
                                                            header="Пользователь запретил оставлять на его странице графиити"
                                                        ></Placeholder>
                                            }
                                        </Div>
                                    </Panel>
                                </View>
                                <View id="autographs" activePanel="autographs">
                                    <Panel id="autographs">
                                        <PanelHeader>Автографы</PanelHeader>

                                        <Div>
                                            {
                                                usersAutographs.length ?
                                                    usersAutographs.map(a => {
                                                        return (
                                                            <AutographCard fromId={a?.from}
                                                                           text={a?.text}
                                                                           type={a?.type}
                                                                           image={a?.image}
                                                                           isAnon={a?.isAnon}
                                                                           name={a?.displayName}
                                                                           date={a?.date}
                                                            />
                                                        )
                                                    })
                                                    : deniedView ?
                                                        <Placeholder icon={<Icon56CameraOffOutline/>}
                                                                     header="Пользователь запретил показывать свои автографы"
                                                        ></Placeholder>
                                                        :
                                                        <Placeholder icon={<Icon56Users3Outline/>}
                                                                     header="Ничего не нашлось" action={<Button
                                                            onClick={() => setActiveStory("leave")}>Оставить
                                                            автограф</Button>}>
                                                            {user?.first_name} пока что не получил ни одного автографа...
                                                        </Placeholder>
                                            }
                                        </Div>
                                    </Panel>
                                </View>
                                <View id="settings" activePanel="settings">
                                    <Panel id="settings">
                                        <PanelHeader>Настройки</PanelHeader>

                                        <Gradient
                                            style={{
                                                margin: "-7px -7px 0 -7px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                textAlign: "center",
                                                padding: 32,
                                            }}
                                        >
                                            <Avatar size={96} src={currentUser?.photo_200}/>
                                            <Title
                                                style={{marginBottom: 8, marginTop: 20}}
                                                level="2"
                                                weight="2"
                                            >
                                                {currentUser?.first_name} {currentUser?.last_name}
                                            </Title>
                                        </Gradient>

                                        <Div>
                                            <FormItem top="Кто может осатавлять автографы">
                                                <NativeSelect value={settingsLeave}
                                                              onInput={e => onSettingsUpdate("leave", e.target.value)}>
                                                    <option value="all">Все</option>
                                                    <option value="nobody">Никто</option>
                                                </NativeSelect>
                                            </FormItem>
                                            <FormItem top="Кто может смотреть мои автографы">
                                                <NativeSelect value={settingsView}
                                                              onInput={e => onSettingsUpdate("view", e.target.value)}>
                                                    <option value="all">Все</option>
                                                    <option value="nobody">Никто</option>
                                                </NativeSelect>
                                            </FormItem>

                                            <Button stretched size="l" style={{marginTop: "20px"}}
                                                    onClick={addToProfile}>
                                                Добавить в профиль
                                            </Button>
                                        </Div>
                                    </Panel>
                                </View>
                            </Epic>
                        </Panel>
                    </View>
                    <View activePanel={activePanel} id="addAutograph">
                        <Panel id="addText">
                            <PanelHeader before={
                                <PanelHeaderBack onClick={() => {
                                    setActiveView("epic")
                                }}/>
                            }>
                                Текстовый автограф
                            </PanelHeader>
                            <Div>
                                <Textarea
                                    placeholder="Оставь небольшую подпись"
                                    onInput={e => setText(e.target.value)}
                                />
                                <Input
                                    style={{marginTop: "12px"}}
                                    placeholder="Отображаемое имя"
                                    disabled={isAnon}
                                    onInput={e => setName(e.target.value)}
                                    value={name}
                                />
                                <Checkbox
                                    description="Нельзя будет увидеть, кто оставил автограф"
                                    onChange={e => setIsAnon(e.target.checked)}
                                >
                                    Оставить отзыв анонимно
                                </Checkbox>

                                <Button style={{marginTop: "20px"}} onClick={() => onSaveText()} stretched size="l"
                                        disabled={!name || !text}>
                                    Отправить
                                </Button>
                            </Div>
                        </Panel>
                        <Panel id="addPhoto">
                            <PanelHeader before={
                                <PanelHeaderBack onClick={() => {
                                    setActiveView("epic")
                                }}/>
                            }>Фото-автограф</PanelHeader>
                            <Div>
                                <File
                                    before={<Icon28UploadOutline/>}
                                    size="l"
                                    accept=".jpg,.jpeg,.png"
                                    stretched
                                    onInput={onUploadPicture}
                                >
                                    Загрузить картинку
                                </File>
                                <Input
                                    style={{marginTop: "12px"}}
                                    value={name}
                                    disabled={isAnon}
                                    onInput={e => setName(e.target.value)}
                                    placeholder="Отображаемое имя"
                                />
                                <Checkbox
                                    description="Нельзя будет увидеть, кто оставил автограф"
                                    onChange={e => setIsAnon(e.target.checked)}
                                >
                                    Оставить отзыв анонимно
                                </Checkbox>

                                <Button style={{marginTop: "20px"}} onClick={() => onSavePicture()} stretched size="l"
                                        disabled={!name || !image}>
                                    Отправить
                                </Button>
                            </Div>
                        </Panel>
                        <Panel id="addPaint">
                            <PanelHeader before={
                                <PanelHeaderBack onClick={() => {
                                    setActiveView("epic")
                                }}/>
                            }>
                                Автограф-граффити
                            </PanelHeader>
                            <Div>
                                <Paintable
                                    width={500}
                                    height={500}
                                    active={active}
                                    color={color}
                                    thickness={thickness}
                                    useEraser={useEraser}
                                    ref={paintableRef}
                                    image={localStorage.getItem('/') || undefined}
                                    onSave={(image) => {
                                        onSaveGraffiti(image)
                                    }}
                                >
                                    <div></div>
                                </Paintable>

                                <Input
                                    style={{marginTop: "12px"}}
                                    placeholder="Отображаемое имя"
                                    value={name}
                                    disabled={isAnon}
                                    onInput={e => setName(e.target.value)}
                                />
                                <Checkbox
                                    description="Нельзя будет увидеть, кто оставил автограф"
                                    onChange={e => setIsAnon(e.target.checked)}
                                >
                                    Оставить отзыв анонимно
                                </Checkbox>

                                <Button style={{marginTop: "20px"}} onClick={() => setActive(false)} stretched size="l"
                                        disabled={!name}>
                                    Отправить
                                </Button>
                            </Div>
                        </Panel>
                    </View>
                </Root>
            </AppRoot>
        );
    },
    {
        viewWidth: true,
    }
);


ReactDOM.render(
    <ConfigProvider>
        <AdaptivityProvider>
            <App/>
        </AdaptivityProvider>
    </ConfigProvider>,
    document.getElementById("root")
);
