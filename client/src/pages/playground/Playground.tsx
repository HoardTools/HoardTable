import { HoardDropzone } from "../../components/HoardDropzone/HoardDropzone";

export function Playground() {
    return <HoardDropzone onChange={console.log} preview />;
}
