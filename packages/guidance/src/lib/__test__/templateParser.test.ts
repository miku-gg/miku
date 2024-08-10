import templateParser from '../templateParser'; // Adjust the import path as needed

describe('extractGenParams', () => {
  it('extracts simple parameters correctly', () => {
    const template = `some text{{GEN example max_tokens=2000 stop=["End"]}}some other text`;
    expect(templateParser(template)).toEqual({
      name: 'example',
      params: {
        max_tokens: 2000,
        stop: ['End'],
      },
      type: 'GEN',
    });
  });

  it('handles multiple parameters and array values', () => {
    const template = `{{GEN complex max_tokens=3000 stop=["\\nExit:", "\\nAnon:"]}}`;
    console.log(templateParser(template));
    expect(templateParser(template)).toEqual({
      type: 'GEN',
      name: 'complex',
      params: {
        max_tokens: 3000,
        stop: ['\nExit:', '\nAnon:'],
      },
    });
  });

  it('returns null for a string without GEN pattern', () => {
    const template = `some regular text without GEN`;
    expect(templateParser(template)).toEqual({
      type: '',
      name: '',
      params: {},
    });
  });

  it('handles the SEL pattern with options parameter', () => {
    const template = `{{SEL choice options=SomeConstantName}}`;
    expect(templateParser(template)).toEqual({
      type: 'SEL',
      name: 'choice',
      params: {
        options: 'SomeConstantName',
      },
    });
  });

  it('extracts multiple parameters including strings, numbers, and arrays', () => {
    const template = `{{GEN multiParam type="stringType" count=10 flags=["flag1", "flag2"]}}`;
    expect(templateParser(template)).toEqual({
      type: 'GEN',
      name: 'multiParam',
      params: {
        type: 'stringType',
        count: 10,
        flags: ['flag1', 'flag2'],
      },
    });
  });

  it('handles complex parameters in SEL pattern', () => {
    const template = `{{SEL complexChoice options=ComplexOptions max_selections=3 custom_flag="enabled"}}`;
    expect(templateParser(template)).toEqual({
      type: 'SEL',
      name: 'complexChoice',
      params: {
        options: 'ComplexOptions',
        max_selections: 3,
        custom_flag: 'enabled',
      },
    });
  });
});
