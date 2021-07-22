import { FormattedMessage as Msg } from 'react-intl';
import { useState } from 'react';
import { Box, Button, ButtonBase, Card, CardContent, Dialog, DialogContent, IconButton, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';

import All from './filters/All';
import MostActive from './filters/MostActive';
import patchTaskItem from 'fetching/tasks/patchTaskItem';
import { useRouter } from 'next/router';
import { ZetkinSmartSearchFilter } from 'types/zetkin';
import { useMutation, useQueryClient } from 'react-query';

interface EditTargetDialogProps {
    filterSpec: ZetkinSmartSearchFilter[];
    onDialogClose: () => void;
    open: boolean;
}

enum FILTER_TYPE {
    ALL ='all',
    MOST_ACTIVE ='most_active',
}

interface ZetkinSmartSearchFilterWithId extends ZetkinSmartSearchFilter {
    id: number;
}

const EditTargetDialog = ({ onDialogClose, open, filterSpec }: EditTargetDialogProps) : JSX.Element => {
    const queryClient = useQueryClient();
    const { orgId, taskId } = useRouter().query;
    const filtersWithIds = filterSpec.map((filter, index) => ({ ...filter, id: index }));
    const [filterArray, setFilterArray] = useState<ZetkinSmartSearchFilterWithId[]>(filtersWithIds);
    const [selectedType, setSelectedType] = useState<FILTER_TYPE | null>(null);

    const taskMutation = useMutation(patchTaskItem(orgId as string, taskId as string),{
        onSettled: () => queryClient.invalidateQueries('tasks'),
    } );

    const handleDialogClose = () => {
        setSelectedType(null);
        onDialogClose();
    };

    const handleCancelFilter = () => setSelectedType(null);

    const handleAddFilter = (filter:ZetkinSmartSearchFilter) => {
        setFilterArray(filterArray.concat({ ...filter, id: Math.max.apply(null, filterArray.map(f => f.id)) + 1 }));
        setSelectedType(null);
    };

    const handleSelectedTypeChange = (type: FILTER_TYPE) => setSelectedType(type);

    const handleSave = () => {
        taskMutation.mutate(filterArray.map(filter => ({
            config: filter.config, op: filter.op, type: filter.type,
        })));
        onDialogClose();
    };

    const handleDeleteFilter = (filter: ZetkinSmartSearchFilterWithId) => {
        setFilterArray(filterArray.filter(f => f.id !== filter.id));
    };

    return (
        <Dialog fullWidth maxWidth="xl" onClose={ handleDialogClose } open={ open }>
            <DialogContent>
                { !selectedType && (
                    <>
                        <Box p={ 1 }>
                            <Typography variant="h6">
                                <Msg id="misc.smartSearch.headers.current"/>
                            </Typography>
                            { filterArray.map(filter => {
                                return (
                                    <Box
                                        key={ filter.id }
                                        border={ 1 }
                                        borderColor={ filter.op === 'sub' ? 'error.light' : 'success.light' }
                                        display="flex"
                                        justifyContent="space-between"
                                        m={ 1 }
                                        p={ 1 }>
                                        <Box>{ JSON.stringify(filter) }</Box>
                                        <Box display="flex" style={{ gap: '1rem' }}>
                                            <IconButton>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={ () => handleDeleteFilter(filter) }>
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                );
                            }) }
                        </Box>
                        <Box p={ 1 }>
                            <Typography variant="h6">
                                <Msg id="misc.smartSearch.headers.add"/>
                            </Typography>
                            { Object.values(FILTER_TYPE).map(value => (
                                <ButtonBase
                                    key={ value }
                                    disableRipple
                                    onClick={ () => handleSelectedTypeChange(value) }>
                                    <Card style={{ margin: '1rem', width: '250px' }}>
                                        <CardContent>
                                            <Typography>
                                                <Msg id={ `misc.smartSearch.filterTitles.${value}` }/>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </ButtonBase>
                            )) }
                            <Box display="flex" justifyContent="flex-end" m={ 1 } style={{ gap: '1rem' }}>
                                <Button color="primary" onClick={ handleDialogClose }>
                                    <Msg id="misc.smartSearch.buttonLabels.cancel"/>
                                </Button>
                                <Button color="primary" onClick={ handleSave } variant="contained">
                                    <Msg id="misc.smartSearch.buttonLabels.save"/>
                                </Button>
                            </Box>
                        </Box>
                    </>
                ) }
                { selectedType === FILTER_TYPE.ALL && <All onCancel={ handleCancelFilter } onSubmit={ handleAddFilter }/> }
                { selectedType === FILTER_TYPE.MOST_ACTIVE && <MostActive onCancel={ handleCancelFilter } onSubmit={ handleAddFilter }/> }
            </DialogContent>
        </Dialog>
    );
};

export default EditTargetDialog;
