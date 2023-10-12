import { Input } from "native-base";

export default function InputNumber(props: { value: number; onChange: (value: number) => void }): React.ReactElement {
    return <Input mt={2} onChangeText={(value): void => props.onChange(parseFloat(value || "0"))} value={props.value.toString() || "0"} />;
}
