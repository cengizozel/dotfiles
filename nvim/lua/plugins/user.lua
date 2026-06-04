return {
  {
    "ibhagwan/fzf-lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    opts = {},
  },
  { "ThePrimeagen/vim-be-good" },
  {
    "folke/snacks.nvim",
    opts = {
      picker = {
        sources = {
          projects = {
            dev = { "~/Documents/GitHub" },
          },
        },
      },
    },
  },
}
