import {Avatar, Card, Div, SimpleCell} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import bridge from "@vkontakte/vk-bridge";
import {Icon28DoorArrowLeftOutline} from "@vkontakte/icons";

export const AutographCard = ({fromId, type, text, image, name, isAnon, date}) => {
    const [fromUser, setFromUser] = useState(null)
    const [userName, setUserName] = useState(name)
    const [avatar, setAvatar] = useState("https://vk.com/images/icons/im_multichat_50.png")

    useEffect(() => {
        async function loadUser() {
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
            setAvatar(user.photo_200)
        }

        if (!isAnon) {
            loadUser()
        }
    }, [])

    return (
        <Card mode="shadow" style={{marginTop: "20px"}}>
            <Div>
                {
                    type === "text" ?
                    <p style={{textAlign: "center", fontSize: "24px"}}>{text}</p> :
                    <img src={image} style={{width: "100%"}} alt=""/>
                }

                <SimpleCell
                    disabled={isAnon}
                    href={!isAnon && "https://vk.com/id" + fromId}
                    target="_blank"
                    before={<Avatar src={avatar}/>}
                    after={<Icon28DoorArrowLeftOutline/>}
                    description={new Date(date).toLocaleDateString()}
                >
                    {name}
                </SimpleCell>
            </Div>
        </Card>
    )
}
