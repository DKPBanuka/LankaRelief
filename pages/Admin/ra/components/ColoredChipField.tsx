import { useRecordContext, ChipField, ChipFieldProps } from 'react-admin';

interface Props extends ChipFieldProps {
    colors?: Record<string, string>;
    defaultColor?: string;
}

export const ColoredChipField = (props: Props) => {
    const record = useRecordContext(props);
    if (!record) return null;

    const value = record[props.source || ''];
    const color = props.colors?.[value] || props.defaultColor || 'default';

    return (
        <ChipField
            {...props}
            color={color as any}
        />
    );
};
