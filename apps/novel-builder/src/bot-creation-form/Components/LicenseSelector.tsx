import { TextHeading } from '@mikugg/ui-kit';
import './LicenseSelector.scss';

export const LICENSES: {
  value: string,
  url: string,
  label: string,
  checks: {checked: boolean, label: string}[]
}[] = [
  {
    value: 'CC BY',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    label: 'CC Attribution 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: true,
        label: 'Allow Commercial use'
      },
      {
        checked: true,
        label: 'Allow Adaptations'
      },
    ],
  },
  {
    value: 'CC BY-SA',
    url: 'https://creativecommons.org/licenses/by-SA/4.0/',
    label: 'CC Attribution-ShareAlike 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: true,
        label: 'Allow Commercial use'
      },
      {
        checked: true,
        label: 'Allow Adaptations (same license)'
      },
    ],
  },
  {
    value: 'CC BY-ND',
    url: 'https://creativecommons.org/licenses/by-nd/4.0/',
    label: 'CC Attribution-NoDerivatives 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: true,
        label: 'Allow Commercial use'
      },
      {
        checked: false,
        label: 'Allow Adaptations'
      },
    ],
  },
  {
    value: 'CC BY-NC',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    label: 'CC Attribution-NonCommercial 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: false,
        label: 'Allow Commercial use'
      },
      {
        checked: true,
        label: 'Allow Adaptations'
      },
    ],
  },
  {
    value: 'CC BY-NC-SA',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    label: 'CC Attribution-NonCommercial-ShareAlike 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: false,
        label: 'Allow Commercial use'
      },
      {
        checked: true,
        label: 'Allow Adaptations (same license)'
      },
    ],
  },
  {
    value: 'CC BY-NC-ND',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    label: 'CC Attribution-NonCommercial-NoDerivatives 4.0 International',
    checks: [
      {
        checked: true,
        label: 'Attribute the author'
      },
      {
        checked: false,
        label: 'Allow Commercial use'
      },
      {
        checked: false,
        label: 'Allow Adaptations'
      },
    ],
  },
  {
    value: 'CC0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    label: 'CC0 1.0 Universal - Public Domain Dedication',
    checks: [
      {
        checked: false,
        label: 'Attribute the author'
      },
      {
        checked: true,
        label: 'Allow Commercial use'
      },
      {
        checked: true,
        label: 'Allow Adaptations'
      },
    ],
  },
];

interface LicenseSelectorProps {
  value: string;
  onChange: (value: string) => void
}

const LicenseSelector = (props: LicenseSelectorProps): JSX.Element | null => {
  const selectedLicense = LICENSES.find((license) => props.value === license.value);
  if (!selectedLicense) return null;
  return (
    <div className="LicenseSelector">
      <TextHeading size="h2">
        Select a license for your bot
      </TextHeading>
      <div className="LicenseSelector__menu">
        {LICENSES.map((license) => {
          return (
            <button
              className={`LicenseSelector__menu-item ${selectedLicense.value === license.value ? 'LicenseSelector__menu-item--selected' : ''}`}
              key={`license-item-${license.value}`}
              onClick={() => props.onChange(license.value)}>
                <img src={`/licenses/${license.value}.png`} />
            </button>
          );
        })}
      </div>
      <div className="LicenseSelector__details">
        <div className="LicenseSelector__details-header">
          <div className="LicenseSelector__details-title">
            {selectedLicense.label}
          </div>
          <a className="LicenseSelector__details-link" href={selectedLicense.url} target="_bank" rel="nofollow" referrerPolicy="no-referrer">More info</a>
        </div>
        <div className="LicenseSelector__details-list">
          {selectedLicense.checks.map(({checked, label}) => {
            return (
              <div
                className="LicenseSelector__details-list-item"
                key={`license-selected-${selectedLicense.value}-check-${label}`}>
                  <span className={`LicenseSelector__details-list-item-check ${checked ? 'checked' : ''}`}>{checked ? '✓' : 'x'}</span>
                  {label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
};

export default LicenseSelector;