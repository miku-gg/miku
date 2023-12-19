import React from 'react';
import ReactSelect from 'react-select/creatable';
import './TagAutocomplete.scss';
import Input from './Input';

interface TagItem {
  value: string;
  color?: string;
}

interface TagAutocompleteProps {
  tags: TagItem[];
  allowCustomTag?: boolean;
  value: TagItem[];
  name?: string;
  id?: string;
  label?: string;
  description?: string;
  onChange: (e: {
    target: {
      name: string;
      value: string[];
    };
  }) => void;
}

const TagAutocomplete = ({
  tags,
  allowCustomTag,
  id,
  label,
  description,
  name,
  value,
  onChange,
}: TagAutocompleteProps): React.ReactElement => {
  const options = tags.map((tag) => ({
    color: tag.color || '#6c7293',
    label: tag.value,
    value: tag.value,
  }));

  return (
    <Input label={label} description={description} id={id} name={name}>
      {
        // @ts-ignore
        <ReactSelect
          defaultValue={[]}
          isMulti
          value={value}
          onChange={(value) => {
            onChange({
              target: {
                name,
                value: value.map((_tag) => _tag.value),
              },
            });
          }}
          menuPlacement="top"
          options={options}
          name={name}
          className="TagAutocomplete"
          classNamePrefix="TagAutocomplete"
        />
      }
    </Input>
  );
};

export default TagAutocomplete;
