{
  pkgs,
  excludes ? [ ],
  ...
}:
{
  projectRootFile = "flake.nix";

  programs = {
    gofmt = {
      enable = true;
    };

    nixfmt = {
      enable = true;
      strict = true;
    };

    shfmt = {
      enable = true;
    };

    yamlfmt = {
      enable = true;

      settings.formatter = {
        eof_newline = true;
        include_document_start = true;
        retain_line_breaks_single = true;
        trim_trailing_whitespace = true;
      };
    };
  };

  settings.global.excludes =
    pkgs.lib.lists.unique [
      "*.graphql"
      "*.png"
      "*.svg"
      "*.txt"
      "doc/man/*.1" # generated via //doc:generate.go
      "doc/md/*" # generated via //doc:generate.go
      "doc/spec/**"
      "misc/completion/*/*"
      "Makefile"
      "webui/pnpm-lock.yaml"
    ]
    ++ excludes;

}
