import React from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';

interface Tag {
  value: string;
  label: string;
  color: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags: Tag[];
}

export default function TagInput({ selectedTags, onChange, availableTags }: TagInputProps) {
  const createOption = (label: string): Tag => ({
    value: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    color: '#3B82F6',
  });

  const handleChange = (newValue: any) => {
    onChange(newValue || []);
  };

  const handleCreate = (inputValue: string) => {
    const newTag = createOption(inputValue);
    onChange([...selectedTags, newTag]);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#EFF6FF',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#1E40AF',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#6B7280',
      '&:hover': {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
      },
    }),
  };

  return (
    <div>
      <Select
        isMulti
        value={selectedTags}
        onChange={handleChange}
        onCreateOption={handleCreate}
        options={availableTags}
        isCreatable
        placeholder="Add tags (e.g., javascript, react, node.js)"
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        formatCreateLabel={(inputValue) => `Create tag "${inputValue}"`}
        noOptionsMessage={() => "Type to create a new tag"}
        maxMenuHeight={200}
        isSearchable
      />
      <p className="mt-1 text-sm text-gray-500">
        Select existing tags or type to create new ones
      </p>
    </div>
  );
}