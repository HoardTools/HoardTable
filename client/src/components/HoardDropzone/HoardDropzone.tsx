import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { Group, Text } from "@mantine/core";
import { MdError, MdPhoto, MdUploadFile } from "react-icons/md";
import { fromByteArray } from "base64-js";
import { useTranslation } from "react-i18next";

export type SerialFile = {
    name: string;
    mimeType: string;
    data: string;
};

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
            maxSize={props.maxSize}
            accept={props.accept}
            disabled={props.disabled}
            onDrop={(allFiles) => {
                allFiles.forEach((file) => {
                    if (Object.keys(files).includes(file.name)) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.addEventListener("load", () => {
                        const serialized = {
                            name: file.name,
                            mimeType: file.type,
                            data: fromByteArray(
                                new Uint8Array(reader.result as ArrayBuffer)
                            ),
                        };
                        setFiles({
                            ...files,
                            [file.name]: serialized,
                        });
                    });
                });
            }}
        >
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
        </Dropzone>
    );
}
