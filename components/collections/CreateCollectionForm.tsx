import React from 'react';

interface Props {
    onCancel: () => void;
    onCreated: (collection: any) => Promise<void>;
}

const CreateCollectionForm = ({ onCancel, onCreated }: Props) => {
    return <div />;
};

export default CreateCollectionForm;
