interface Login {
  email: string;
  password: string;
  type: string;
  ipAddress?: string;
}

interface VerifyOTP {
  code: string;
  otpTransactionId: string | undefined;
}

interface Signup {
  firstname: string;
  lastname: string;
  phone: string;
  password: string;
  countryCode: string;
  dob: string;
}

interface AdministratorUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  roles: number;
  reEnterPassword: string;
  azureId?: string;
}
