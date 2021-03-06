import React, {useRef, useState} from 'react';
import {Paintable} from 'paintablejs/react';
import {Button, Checkbox, Input} from "@vkontakte/vkui";

function Graffiti({onSave}) {
    const paintableRef = useRef(null);
    const [color, setColor] = useState('#0000FF');
    const [active, setActive] = useState(false);
    const [thickness, setThickness] = useState(5);
    const [useEraser, setUseEraser] = useState(false);

    const onSaveImage = (image) => {
        onSave(image)
    }

    return (
        <div>
            <div>
                <button onClick={() => paintableRef.current?.clear()}>Clear</button>
                <button onClick={() => paintableRef.current?.undo()}>Undo</button>
                <button onClick={() => paintableRef.current?.redo()}>Redo</button>
                <button
                    onClick={() => {
                        setUseEraser(false);
                        setActive(!active);
                    }}
                >
                    {active ? 'save' : 'edit'}
                </button>
                <button onClick={() => setUseEraser(!useEraser)}>
                    {useEraser ? 'use pencil' : 'use eraser'}
                </button>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <input
                    type="range"
                    defaultValue={5}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    min={1}
                    max={30}
                    step={1}
                />
            </div>

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
                    onSaveImage(image)
                }}
            >
                <div></div>
            </Paintable>

            <Input
                style={{marginTop: "12px"}}
                placeholder="???????????????????????? ??????"
            />
            <Checkbox
                description="???????????? ?????????? ??????????????, ?????? ?????????????? ????????????????"
            >
                ???????????????? ?????????? ????????????????
            </Checkbox>

            <Button style={{marginTop: "20px"}} onClick={onSaveImage} stretched size="l">
                ??????????????????
            </Button>
        </div>
    );
}

export default Graffiti;
