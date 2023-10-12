import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { useState } from "react";
import { Button, Input, Pressable } from "native-base";
import moment from "moment";

export default function InputDate(props: { value: Date; onChange: (value: Date) => void }): React.ReactElement {
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);

    const [date, setDate] = useState(new Date(props.value));
    const [hours, setHours] = useState(new Date(props.value).getHours());
    const [minutes, setMinutes] = useState(new Date(props.value).getMinutes());

    const onConfirmDate = (params: { date: any & { getDate: () => number } }): void => {
        if (!params.date) return;
        setDate(new Date(params.date.getFullYear(), params.date.getMonth(), params.date.getDate()));
        setDateOpen(false);
        setTimeOpen(true);
    };
    const onConfirmTime = (hoursAndMinutes: { hours: number; minutes: number }): void => {
        setTimeOpen(false);
        setHours(hoursAndMinutes.hours);
        setMinutes(hoursAndMinutes.minutes);

        props.onChange(new Date(date.getTime() + 1000 * 60 * 60 * hoursAndMinutes.hours + 1000 * 60 * hoursAndMinutes.minutes));
    };
    const onDismiss = (): void => {
        setDateOpen(false);
        setTimeOpen(false);
    };

    return (
        <>
            <Pressable mt={2} onPress={(): void => setDateOpen(true)} onFocus={(): void => setDateOpen(true)} display={"flex"} flexDirection={"row"} style={{ gap: 2 }}>
                <Input value={moment(props.value).format("DD/MM/YYYY HH:mm")} flexGrow={1} isReadOnly={true} />
                <Button onPress={(): void => setDateOpen(true)}>Edit</Button>
            </Pressable>
            <DatePickerModal visible={dateOpen} date={date} mode="single" onConfirm={onConfirmDate} onDismiss={onDismiss} locale="en" />
            <TimePickerModal visible={timeOpen} hours={hours} minutes={minutes} onConfirm={onConfirmTime} onDismiss={onDismiss} />
        </>
    );
}
