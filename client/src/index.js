import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {
    AdaptivityProvider,
    AppRoot,
    Button,
    Checkbox,
    ConfigProvider,
    Div,
    Epic,
    File,
    Group,
    Input,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Root, ScreenSpinner,
    Tabbar,
    TabbarItem,
    Textarea,
    View,
    withAdaptivity
} from "@vkontakte/vkui";
import {
    Icon28NewsfeedOutline,
    Icon28ServicesOutline,
    Icon28UploadOutline,
    Icon56ComputerOutline,
    Icon56MessagesOutline,
    Icon56PaletteOutline
} from "@vkontakte/icons";
import "@vkontakte/vkui/dist/vkui.css";
import {Paintable} from "paintablejs/react";

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

        const showSpinner = () => {
            setPopout(<ScreenSpinner/>)
        }

        const hideSpinner = () => {
            setPopout(null)
        }

        const onSaveGraffiti = (image) => {
            setImage(image)
            paintableRef.current?.clear()
            setActive(true)
            setActiveView("epic")
        }

        const onSaveText = () => {
            console.log(name, text, isAnon)
        }

        const onSavePicture = () => {
            console.log(name, image, isAnon)
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

        const clearData = () => {
            setName("")
            setImage("")
            setIsAnon(false)
            setActiveView("epic")
        }

        useEffect(() => {
            if (isAnon) {
                setName("Аноним")
            } else {
                setName("Человек")
            }
        }, [isAnon])

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
                                        <TabbarItem
                                            onClick={onStoryChange}
                                            selected={activeStory === "leave"}
                                            data-story="leave"
                                            text="Оставить автограф"
                                        >
                                            <Icon28ServicesOutline/>
                                        </TabbarItem>
                                    </Tabbar>
                                }
                            >
                                <View id="my_autographs" activePanel="my_autographs">
                                    <Panel id="my_autographs">
                                        <PanelHeader>Мои автографы</PanelHeader>
                                    </Panel>
                                </View>
                                <View id="leave" activePanel="leave">
                                    <Panel id="leave">
                                        <PanelHeader>Оставить автограф</PanelHeader>
                                        <Div>
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
