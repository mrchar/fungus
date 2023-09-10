<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api";

const router = useRouter();

const formData = ref({
  name: "",
  email: "",
});

function onClickLogin() {
  if (!formData.value.name || !formData.value.email) {
    throw new Error("请输入名称和邮箱地址");
  }

  api.user
    .login(formData.value.name)
    .then((res) => {
      api.user.setCurrentUser(res);
    })
    .catch((err) => {
      console.warn("当前用户还没有注册", err);
      api.user
        .register(formData.value.name, formData.value.email)
        .then((res) => {
          api.user.setCurrentUser(res);
          router.push("/game");
        })
        .catch((err) => {
          console.error("登陆失败", err);
        });
    });
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden">
    <div class="flex w-full h-full justify-center items-center">
      <form id="login-form" class="flex w-fit h-fit p-2 flex-col gap-2">
        <div class="flex gap-2 justify-end">
          <label for="name">名称</label>
          <input
            v-model="formData.name"
            id="name"
            class="border rounded"
            name="name"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <label for="email">电子邮箱</label>
          <input
            v-model="formData.email"
            id="email"
            class="border rounded"
            name="email"
          />
        </div>
        <div class="w-full text-right">
          <button
            class="border px-2 rounded bg-primary text-white"
            type="button"
            @click="onClickLogin"
          >
            登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
#login-form label {
  @apply text-right w-[4rem];
}

#login-form input {
  @apply w-[14rem];
}
</style>
