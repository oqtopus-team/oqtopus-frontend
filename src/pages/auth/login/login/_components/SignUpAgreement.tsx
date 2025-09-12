import { Trans } from 'react-i18next';
import { NavLink } from 'react-router';

export interface Props {
  termsOfService: string,
  privacyPolicy: string,
};

export const SignUpAgreement = (props: Props) => {
  return (
    <Trans i18nKey="signup.disclaimer">
        Please check <NavLink to={props.termsOfService} className="text-link">the term of use</NavLink> and <NavLink to={props.privacyPolicy} className="text-link">the privacy policy</NavLink>, and if you agree, 
        please complete the account registration below.
    </Trans>
  )
}
