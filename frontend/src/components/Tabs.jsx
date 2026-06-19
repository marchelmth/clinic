import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

export default function LabTabs({ label1, children1, label2, children2, label3, children3, label4, children4, label5, children5 }) {
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab label={label1} value="1" />
                        <Tab label={label2} value="2" />
                        <Tab label={label3} value="3" />
                        <Tab label={label4} value="4" />
                        <Tab label={label5} value="5" />
                    </TabList>
                </Box>
                <TabPanel value="1">{children1}</TabPanel>
                <TabPanel value="2">{children2}</TabPanel>
                <TabPanel value="3">{children3}</TabPanel>
                <TabPanel value="4">{children4}</TabPanel>
                <TabPanel value="5">{children5}</TabPanel>
            </TabContext>
        </Box>
    );
}
