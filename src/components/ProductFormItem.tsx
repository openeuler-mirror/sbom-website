import {
    ElInput,
    ElInputNumber,
    ElOption,
    ElRadioButton,
    ElRadioGroup,
    ElSelect,
} from 'element-plus'
import { defineComponent } from 'vue'


const Input = (form: Record<string, any>, data: Record<string, any>, context: any) => (
    <ElInput
        v-model={form.data[data.name]}
        clearable
        onChange={(val) => { context.emit('handleChange', val, data) }}
    >
    </ElInput>
)

const InputNumber = (form: Record<string, any>, data: Record<string, any>, context: any) => (
    <ElInputNumber
        v-model={form.data[data.name]}
        controls-position="right"
        onChange={(val) => { context.emit('handleChange', val, data) }}
    />

)

const setLabelValue = (data: any, _item: any,) => {
    return {
        label: data.valueLabel || _item,
        value: _item,
    }
}
const Select = (form: Record<string, any>, name: string, data: any, context: any) => (
    <ElSelect
        v-model={form.data[name]}
        filterable
        clearable
        onChange={(val) => { context.emit('handleChange', val, data, name) }}
        >

        {Object.keys(data).map((item: any) => {
            return <ElOption {...setLabelValue(data[item], item)} />
        })}

    </ElSelect>
)

const Radio = (form: Record<string, any>, name: string, data: any, context: any) => (
    <ElRadioGroup
        v-model={form.data[name]}
        text-color='#fff'
        fill='#4971FF'
        onChange={(val) => { context.emit('handleChange', val, data, name) }}
        >

        {Object.keys(data).map((item: any) => {
            return <ElRadioButton {...setLabelValue(data[item], item)} />
        })}

    </ElRadioGroup>
)

const setFormItem = (
    form: Record<string, any> | undefined,
    data: Record<string, any> | undefined,
    context: any
) => {
    if (!form) return null
    if (!data) return null

    let valueType = data.valueType || 'radio';
    let enumValue = "";
    const ENUM_REGEX = /enum\((.*)\)/g
    const enumMatch = ENUM_REGEX.exec(valueType);
    if (enumMatch) {
        valueType = "select";
        enumValue = enumMatch[1]
    }
    if(data.valueToNextConfig && Object.keys(data.valueToNextConfig).length > 8) {
        valueType = 'select'
    }
    switch (valueType) {
        case 'string':
            return Input(form, data, context)
        case 'number':
            return InputNumber(form, data, context)
        case 'select':
            return Select(form, data.name, data.valueToNextConfig, context)
        case 'radio':
            return Radio(form, data.name, data.valueToNextConfig, context)
        default:
            return null
    }
}

export default defineComponent({
    name: 'FormItem',
    props: {
        data: Object,
        formData: Object,
    },
    setup(props, context) {
        return () => {
            return props.data
                ? setFormItem(props.formData, props.data, context)
                : null
        }
    },
})
