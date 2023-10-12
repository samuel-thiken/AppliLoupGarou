import { Input } from "native-base";

export default function InputText(props: { value: string; onChange: (value: string) => void; InputRightElement?: JSX.Element; placeholder?: string; type?: "text" | "password" }): React.ReactElement {
    return (
        <Input
            mt={2}
            onChangeText={(value): void => props.onChange(value)}
            value={props.value}
            InputRightElement={props.InputRightElement}
            placeholder={props.placeholder}
            type={props.type || "text"}
        />
    );
}
