import React from 'react';
import ReactSelect from 'react-select/creatable';
import './TagAutocomplete.scss';

interface TagItem {
  value: string;
  color?: string;
}

interface TagAutocompleteProps {
  tags: TagItem[];
  allowCustomTag?: boolean;
  value: TagItem[];
  name: string;
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
  name,
  value,
  onChange,
}: TagAutocompleteProps): JSX.Element => {
  const options = tags.map((tag) => ({
    color: tag.color || '#6c7293',
    label: tag.value,
    value: tag.value,
  }));

  return (
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
  );
};

export default TagAutocomplete;
