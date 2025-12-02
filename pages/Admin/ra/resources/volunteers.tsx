import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    DeleteButton,
    ArrayField,
    SingleFieldList,
    ChipField,
    SimpleList
} from 'react-admin';
import { Theme, useMediaQuery } from '@mui/material';

export const VolunteerList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
    return (
        <List>
            {isSmall ? (
                <SimpleList
                    primaryText={record => record.name}
                    secondaryText={record => record.district}
                    tertiaryText={record => record.phone}
                />
            ) : (
                <Datagrid rowClick="show">
                    <TextField source="name" sx={{ fontWeight: 'bold' }} />
                    <EmailField source="email" />
                    <TextField source="phone" />
                    <TextField source="district" />
                    <ArrayField source="skills">
                        <SingleFieldList>
                            <ChipField source="" size="small" variant="outlined" />
                        </SingleFieldList>
                    </ArrayField>
                    <DateField source="joinedAt" />
                    <DeleteButton />
                </Datagrid>
            )}
        </List>
    );
};
