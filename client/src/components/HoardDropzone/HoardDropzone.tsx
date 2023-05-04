import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { Group, Stack, Text, ActionIcon } from "@mantine/core";
import { MdDelete, MdError, MdPhoto, MdUploadFile } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { readFileAsBase64 } from "../../util/asyncReader";
import "./style.scss";
import { isEqual, unset } from "lodash";
import { ApiAccess } from "../../util/api";
import { ContentMetadata } from "../../types/content";

export type SerialFile = {
    name: string;
    mimeType: string;
    data: string;
};

export type ContentCreate = {
    filename: string;
    mime_type: string;
    data: string;
    reference: { collection: string; resource: string };
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
    label?: string;
    preview?: boolean;
    accept?: string[];
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    onChange?: (files: { [key: string]: SerialFile }) => void;
    files?: { [key: string]: SerialFile };
}) {
    const [files, setFiles] = useState<{ [key: string]: SerialFile }>(
        props.files ?? {}
    );
    const { t } = useTranslation();

    useEffect(() => {
        if (!isEqual(files, props.files)) {
            props.onChange && props.onChange(files);
        }
    }, [files]);

    useEffect(() => {
        if (props.files) {
            setFiles(props.files);
        }
    }, [props.files]);

    return (
        <Stack spacing={2} className="hoard-dropzone-wrapper">
            {props.label && <Text className="label">{props.label}</Text>}
            <Dropzone
                maxFiles={props.maxFiles}
                multiple={props.maxFiles ? props.maxFiles > 1 : true}
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
                                                const newFiles = { ...files };
                                                unset(newFiles, v.name);
                                                setFiles(newFiles);
                                            }}
                                            className="delete-btn"
                                            color="red"
                                        >
                                            <MdDelete />
                                        </ActionIcon>
                                        <img
                                            alt=""
                                            className="prev-img"
                                            src={
                                                v.mimeType === "usercontent"
                                                    ? v.data
                                                    : `data:${
                                                          v.mimeType
                                                      };base64,${v.data
                                                          .replaceAll("-", "+")
                                                          .replaceAll(
                                                              "_",
                                                              "/"
                                                          )}`
                                            }
                                        />
                                    </div>
                                ))}
                            </Group>
                        </div>
                    )}
                </Stack>
            </Dropzone>
        </Stack>
    );
}

export async function submitUserContent(
    file: SerialFile,
    reference: { collection: string; resource: string }
): Promise<string | null> {
    const { post } = new ApiAccess();
    const result = await post<ContentMetadata>("content", {
        body: {
            filename: file.name,
            mime_type: file.mimeType,
            data: file.data,
            reference,
        },
    });
    if (result.success) {
        return result.result.url;
    } else {
        return null;
    }
}

export function getContentModel(
    file: SerialFile,
    reference: { collection: string; resource: string }
): ContentCreate {
    return {
        filename: file.name,
        mime_type: file.mimeType,
        data: file.data,
        reference,
    };
}
