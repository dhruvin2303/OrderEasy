import React from 'react';
import { Plus, X } from 'lucide-react';

export interface CustomField {
    key: string;
    value: string;
}

interface DynamicFieldsInputProps {
    fields: CustomField[];
    onChange: (fields: CustomField[]) => void;
}

export const DynamicFieldsInput: React.FC<DynamicFieldsInputProps> = ({ fields, onChange }) => {
    const addField = () => {
        onChange([...fields, { key: '', value: '' }]);
    };

    const removeField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        onChange(newFields);
    };

    const updateField = (index: number, key: string, value: string) => {
        const newFields = [...fields];
        newFields[index] = { key, value };
        onChange(newFields);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Custom Fields (Optional)</label>
                <button
                    type="button"
                    onClick={addField}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Field
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-md border border-slate-100 text-center">
                    No custom fields added. Click "Add Field" to add specific order details like Driver Name, GST Number, etc.
                </div>
            ) : (
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Field Name (e.g., Location)"
                                value={field.key}
                                onChange={(e) => updateField(index, e.target.value, field.value)}
                                className="flex-1 w-1/3 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Value (e.g., Mehsana)"
                                value={field.value}
                                onChange={(e) => updateField(index, field.key, e.target.value)}
                                className="flex-1 w-2/3 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeField(index)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Remove Field"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
