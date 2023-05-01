import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { Group, Stack, Text, ActionIcon } from "@mantine/core";
import { MdDelete, MdError, MdPhoto, MdUploadFile } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { readFileAsBase64 } from "../../util/asyncReader";
import "./style.scss";
import { unset } from "lodash";

export type SerialFile = {
    name: string;
    mimeType: string;
    data: string;
};

async function readAllFiles(
    files: File[]
): Promise<{ [key: string]: SerialFile }> {
    const result: { [key: string]: SerialFile } = {};
    for (const f of files) {
        const fileData = await readFileAsBase64(f);
        result[f.name] = {
            name: f.name,
            mimeType: f.type,
            data: fileData,
        };
    }
    return result;
}

export function HoardDropzone(props: {
    preview?: boolean;
    accept?: string[];
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    onChange?: (files: { [key: string]: SerialFile }) => void;
}) {
    const [files, setFiles] = useState<{ [key: string]: SerialFile }>({});
    const { t } = useTranslation();

    useEffect(() => {
        props.onChange && props.onChange(files);
    }, [files]);

    return (
        <Dropzone
            maxFiles={props.maxFiles}
            className="hoard-dropzone"
            maxSize={props.maxSize}
            accept={props.accept ?? ["image/*"]}
            disabled={props.disabled}
            onDrop={(files) => readAllFiles(files).then(setFiles)}
        >
            <Stack spacing={"md"} style={{ height: "100%" }}>
                <Group
                    position="center"
                    spacing="xl"
                    style={{ pointerEvents: "none" }}
                >
                    <Dropzone.Accept>
                        <MdUploadFile size={32} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <MdError size={32} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <MdPhoto size={32} />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                            {t("components.dropzone.title")}
                        </Text>
                    </div>
                </Group>
                {props.preview && Object.keys(files).length > 0 && (
                    <div className="preview-scroller">
                        <Group
                            spacing={"md"}
                            position="center"
                            className="preview-container"
                        >
                            {Object.values(files).map((v, i) => (
                                <div className="prev-img-wrapper" key={i}>
                                    <ActionIcon
                                        radius={"xl"}
                                        variant="filled"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            unset(files, v.name);
                                            setFiles({ ...files });
                                        }}
                                        className="delete-btn"
                                        color="red"
                                    >
                                        <MdDelete />
                                    </ActionIcon>
                                    <img
                                        alt=""
                                        className="prev-img"
                                        src={`data:${v.mimeType};base64,${v.data
                                            .replaceAll("-", "+")
                                            .replaceAll("_", "/")}`}
                                    />
                                </div>
                            ))}
                        </Group>
                    </div>
                )}
            </Stack>
        </Dropzone>
    );
}
