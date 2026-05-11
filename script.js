const form = document.querySelector("#signup-form");
const fields = {
    nome: document.querySelector("#nome"),
    cpf: document.querySelector("#cpf"),
    nascimento: document.querySelector("#nascimento"),
    telefone: document.querySelector("#telefone"),
    email: document.querySelector("#email"),
};
const successMessage = document.querySelector("#success-message");

function onlyNumbers(value) {
    return value.replace(/\D/g, "");
}

function formatCpf(value) {
    return onlyNumbers(value)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value) {
    const digits = onlyNumbers(value).slice(0, 11);

    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCpf(value) {
    const cpf = onlyNumbers(value);

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i += 1) {
        sum += Number(cpf[i]) * (10 - i);
    }

    let digit = (sum * 10) % 11;
    if (digit === 10) {
        digit = 0;
    }

    if (digit !== Number(cpf[9])) {
        return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i += 1) {
        sum += Number(cpf[i]) * (11 - i);
    }

    digit = (sum * 10) % 11;
    if (digit === 10) {
        digit = 0;
    }

    return digit === Number(cpf[10]);
}

function setFieldState(input, message) {
    const field = input.closest(".field");
    const error = document.querySelector(`#${input.id}-error`);
    const hasError = Boolean(message);

    field.classList.toggle("is-invalid", hasError);
    field.classList.toggle("is-valid", !hasError && input.value.trim() !== "");
    input.setAttribute("aria-invalid", String(hasError));
    error.textContent = message;
}

function getAge(dateValue) {
    const today = new Date();
    const birthDate = new Date(`${dateValue}T00:00:00`);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return age;
}

function validateField(input) {
    const value = input.value.trim();
    let message = "";

    if (!value) {
        message = "Este campo e obrigatorio.";
    } else if (input.id === "nome" && value.split(/\s+/).length < 2) {
        message = "Digite nome e sobrenome.";
    } else if (input.id === "cpf" && !isValidCpf(value)) {
        message = "Digite um CPF valido e unico.";
    } else if (input.id === "nascimento") {
        const age = getAge(value);
        if (Number.isNaN(age) || age < 0) {
            message = "A data nao pode estar no futuro.";
        } else if (age < 12) {
            message = "A idade minima e 12 anos.";
        }
    } else if (input.id === "telefone" && onlyNumbers(value).length < 10) {
        message = "Digite um telefone valido com DDD.";
    } else if (input.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message = "Digite um email valido.";
    }

    setFieldState(input, message);
    return !message;
}

fields.cpf.addEventListener("input", () => {
    fields.cpf.value = formatCpf(fields.cpf.value);
    validateField(fields.cpf);
});

fields.telefone.addEventListener("input", () => {
    fields.telefone.value = formatPhone(fields.telefone.value);
    validateField(fields.telefone);
});

Object.values(fields).forEach((input) => {
    if (input.id !== "cpf" && input.id !== "telefone") {
        input.addEventListener("input", () => validateField(input));
    }

    input.addEventListener("blur", () => validateField(input));
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.textContent = "";

    const validationResults = Object.values(fields).map(validateField);
    const formIsValid = validationResults.every(Boolean);

    if (!formIsValid) {
        successMessage.textContent = "";
        return;
    }

    successMessage.textContent = "Cadastro validado com sucesso!";
    form.reset();
    Object.values(fields).forEach((input) => {
        input.closest(".field").classList.remove("is-valid", "is-invalid");
        input.setAttribute("aria-invalid", "false");
    });
});
